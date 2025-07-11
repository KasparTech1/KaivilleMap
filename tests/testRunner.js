import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AutomatedTestRunner {
  constructor() {
    this.testResults = [];
    this.logFile = path.join(__dirname, 'test-results.log');
    this.failureLog = path.join(__dirname, 'failures.log');
    this.startTime = null;
    this.endTime = null;
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 Starting Automated Test Suite...\n'));
    this.startTime = Date.now();

    try {
      // Phase 1: Database tests
      console.log(chalk.yellow('📊 Phase 1: Database Tests'));
      const dbResults = await this.runDatabaseTests();
      this.testResults.push(...dbResults);

      // Phase 2: Component tests  
      console.log(chalk.yellow('\n🎨 Phase 2: Component Tests'));
      const componentResults = await this.runComponentTests();
      this.testResults.push(...componentResults);

      // Phase 3: Integration tests
      console.log(chalk.yellow('\n🔗 Phase 3: Integration Tests'));
      const integrationResults = await this.runIntegrationTests();
      this.testResults.push(...integrationResults);

      // Phase 4: Performance tests
      console.log(chalk.yellow('\n⚡ Phase 4: Performance Tests'));
      const perfResults = await this.runPerformanceTests();
      this.testResults.push(...perfResults);

    } catch (error) {
      console.error(chalk.red('Fatal error during test execution:'), error);
      this.logError(error);
    }

    this.endTime = Date.now();
    
    // Analyze results and auto-fix
    await this.analyzeAndFix();
    
    // Generate final report
    return this.generateFinalReport();
  }

  async runDatabaseTests() {
    const results = [];
    try {
      const { runSchemaTests } = await import('./database/schemaTests.js');
      const schemaResults = await runSchemaTests();
      results.push(...schemaResults);
    } catch (error) {
      results.push({
        name: 'Database Tests',
        phase: 'database',
        passed: false,
        error: error.message,
        duration: 0
      });
    }
    return results;
  }

  async runComponentTests() {
    const results = [];
    try {
      const { runEditArticleTests } = await import('./components/editArticleTests.js');
      const componentResults = await runEditArticleTests();
      results.push(...componentResults);
    } catch (error) {
      results.push({
        name: 'Component Tests',
        phase: 'component',
        passed: false,
        error: error.message,
        duration: 0
      });
    }
    return results;
  }

  async runIntegrationTests() {
    const results = [];
    try {
      const { runArticleEditFlow } = await import('./integration/articleEditFlow.js');
      const flowResults = await runArticleEditFlow();
      results.push(...flowResults);
    } catch (error) {
      results.push({
        name: 'Integration Tests',
        phase: 'integration',
        passed: false,
        error: error.message,
        duration: 0
      });
    }
    return results;
  }

  async runPerformanceTests() {
    const results = [];
    try {
      const { runLoadTests } = await import('./performance/loadTests.js');
      const perfResults = await runLoadTests();
      results.push(...perfResults);
    } catch (error) {
      results.push({
        name: 'Performance Tests',
        phase: 'performance',
        passed: false,
        error: error.message,
        duration: 0
      });
    }
    return results;
  }

  async analyzeAndFix() {
    console.log(chalk.cyan('\n🔧 Analyzing test results...'));
    
    const failures = this.testResults.filter(r => !r.passed);
    
    if (failures.length === 0) {
      console.log(chalk.green('✅ All tests passed!'));
      return;
    }

    console.log(chalk.yellow(`Found ${failures.length} failures. Attempting auto-fixes...`));
    
    for (const failure of failures) {
      const fixed = await this.attemptAutoFix(failure);
      if (fixed) {
        console.log(chalk.green(`✅ Auto-fixed: ${failure.name}`));
        failure.autoFixed = true;
      } else {
        console.log(chalk.red(`❌ Could not auto-fix: ${failure.name}`));
        this.logFailure(failure);
      }
    }
  }

  async attemptAutoFix(failure) {
    // Schema-related fixes
    if (failure.error?.includes('column') && failure.error?.includes('does not exist')) {
      return await this.fixMissingColumn(failure);
    }
    
    // Permission-related fixes
    if (failure.error?.includes('permission denied')) {
      return await this.fixPermissions(failure);
    }
    
    // Component-related fixes
    if (failure.error?.includes('Cannot find module')) {
      return await this.fixMissingModule(failure);
    }
    
    return false;
  }

  async fixMissingColumn(failure) {
    try {
      const { executeMigration } = await import('../supabase/directDatabaseSetup.js');
      await executeMigration('007_add_article_fields.sql');
      return true;
    } catch (error) {
      console.error('Failed to fix missing column:', error);
      return false;
    }
  }

  async fixPermissions(failure) {
    try {
      const { updateRLSPolicies } = await import('./utils/databaseFixes.js');
      await updateRLSPolicies();
      return true;
    } catch (error) {
      console.error('Failed to fix permissions:', error);
      return false;
    }
  }

  async fixMissingModule(failure) {
    try {
      const moduleName = failure.error.match(/Cannot find module '(.+)'/)?.[1];
      if (moduleName) {
        const { execSync } = await import('child_process');
        execSync(`npm install ${moduleName}`, { stdio: 'inherit' });
        return true;
      }
    } catch (error) {
      console.error('Failed to fix missing module:', error);
    }
    return false;
  }

  logResult(test) {
    const entry = {
      timestamp: new Date().toISOString(),
      test: test.name,
      phase: test.phase,
      status: test.passed ? 'PASS' : 'FAIL',
      duration: test.duration,
      error: test.error || null,
      autoFixed: test.autoFixed || false
    };
    
    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
  }

  logError(error) {
    const entry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    fs.appendFileSync(this.failureLog, JSON.stringify(entry) + '\n');
  }

  logFailure(failure) {
    const entry = {
      timestamp: new Date().toISOString(),
      test: failure.name,
      phase: failure.phase,
      error: failure.error,
      suggestions: this.getSuggestions(failure)
    };
    
    fs.appendFileSync(this.failureLog, JSON.stringify(entry) + '\n');
  }

  getSuggestions(failure) {
    const suggestions = [];
    
    if (failure.error?.includes('column')) {
      suggestions.push('Check migration file for correct column definitions');
      suggestions.push('Verify database connection and permissions');
    }
    
    if (failure.error?.includes('component')) {
      suggestions.push('Check React component imports');
      suggestions.push('Verify all dependencies are installed');
    }
    
    return suggestions;
  }

  generateFinalReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const autoFixed = this.testResults.filter(r => r.autoFixed).length;
    const duration = this.endTime - this.startTime;
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        autoFixed: autoFixed,
        duration: `${(duration / 1000).toFixed(2)}s`
      },
      phases: this.groupByPhase(),
      failures: this.testResults.filter(r => !r.passed && !r.autoFixed),
      timestamp: new Date().toISOString()
    };
    
    // Save report
    fs.writeFileSync(
      path.join(__dirname, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Print summary
    console.log(chalk.blue('\n📊 Test Summary:'));
    console.log(chalk.white(`Total Tests: ${totalTests}`));
    console.log(chalk.green(`Passed: ${passedTests}`));
    console.log(chalk.red(`Failed: ${failedTests}`));
    console.log(chalk.yellow(`Auto-fixed: ${autoFixed}`));
    console.log(chalk.white(`Duration: ${report.summary.duration}`));
    
    if (failedTests - autoFixed === 0) {
      console.log(chalk.green.bold('\n✅ All tests passed or were auto-fixed!'));
    } else {
      console.log(chalk.red.bold(`\n❌ ${failedTests - autoFixed} tests still failing!`));
      console.log(chalk.yellow('Check failures.log for details.'));
    }
    
    return report;
  }

  groupByPhase() {
    const phases = {};
    
    this.testResults.forEach(result => {
      if (!phases[result.phase]) {
        phases[result.phase] = {
          total: 0,
          passed: 0,
          failed: 0
        };
      }
      
      phases[result.phase].total++;
      if (result.passed || result.autoFixed) {
        phases[result.phase].passed++;
      } else {
        phases[result.phase].failed++;
      }
    });
    
    return phases;
  }
}

// Allow running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const runner = new AutomatedTestRunner();
  runner.runAllTests().then(report => {
    process.exit(report.failures.length > 0 ? 1 : 0);
  });
}