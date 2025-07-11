import { AutomatedTestRunner } from './testRunner.js';
import chalk from 'chalk';

console.log(chalk.blue.bold('🚀 Kaiville Article Edit Feature - Complete Test Suite\n'));

const runner = new AutomatedTestRunner();

runner.runAllTests()
  .then(report => {
    console.log(chalk.blue.bold('\n📋 Final Test Report:'));
    console.log(chalk.white('='.repeat(50)));
    
    if (report.summary.failed === 0) {
      console.log(chalk.green.bold('\n✅ ALL TESTS PASSED! 🎉'));
      console.log(chalk.green(`\n${report.summary.total} tests completed successfully in ${report.summary.duration}`));
    } else {
      console.log(chalk.red.bold(`\n❌ ${report.summary.failed} TESTS FAILED`));
      console.log(chalk.yellow('\nFailed tests:'));
      report.failures.forEach((failure, index) => {
        console.log(chalk.red(`\n${index + 1}. ${failure.test} (${failure.phase})`));
        console.log(chalk.gray(`   Error: ${failure.error}`));
      });
    }
    
    console.log(chalk.white('\n' + '='.repeat(50)));
    console.log(chalk.cyan('\n📄 Detailed logs saved to:'));
    console.log(chalk.gray('   - tests/test-results.log'));
    console.log(chalk.gray('   - tests/test-report.json'));
    console.log(chalk.gray('   - tests/test-summary.txt'));
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error(chalk.red.bold('\n❌ FATAL ERROR:'), error.message);
    process.exit(1);
  });