import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestLogger {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'test-results.log');
    this.failureLog = path.join(__dirname, '..', 'failures.log');
    this.ensureLogFiles();
  }

  ensureLogFiles() {
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
    }
    
    if (!fs.existsSync(this.failureLog)) {
      fs.writeFileSync(this.failureLog, '');
    }
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

  async getTestResults() {
    try {
      const logs = fs.readFileSync(this.logFile, 'utf-8');
      return logs.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      console.error('Error reading test results:', error);
      return [];
    }
  }

  async getFailures() {
    const results = await this.getTestResults();
    return results.filter(r => r.status === 'FAIL');
  }

  async analyzeFailures() {
    const failures = await this.getFailures();
    
    // Group failures by type
    const failureTypes = {};
    
    failures.forEach(failure => {
      const type = this.categorizeFailure(failure.error);
      if (!failureTypes[type]) {
        failureTypes[type] = [];
      }
      failureTypes[type].push(failure);
    });
    
    return {
      total: failures.length,
      byType: failureTypes,
      patterns: this.identifyPatterns(failures),
      suggestions: this.generateSuggestions(failureTypes)
    };
  }

  categorizeFailure(error) {
    if (!error) return 'unknown';
    
    if (error.includes('column') || error.includes('table')) {
      return 'database';
    }
    if (error.includes('component') || error.includes('React')) {
      return 'component';
    }
    if (error.includes('permission') || error.includes('denied')) {
      return 'permission';
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'network';
    }
    if (error.includes('timeout')) {
      return 'performance';
    }
    
    return 'other';
  }

  identifyPatterns(failures) {
    const patterns = [];
    
    // Check for repeated errors
    const errorCounts = {};
    failures.forEach(f => {
      if (f.error) {
        errorCounts[f.error] = (errorCounts[f.error] || 0) + 1;
      }
    });
    
    Object.entries(errorCounts).forEach(([error, count]) => {
      if (count > 1) {
        patterns.push({
          type: 'repeated_error',
          error,
          count,
          severity: 'high'
        });
      }
    });
    
    // Check for phase-specific failures
    const phaseFailures = {};
    failures.forEach(f => {
      phaseFailures[f.phase] = (phaseFailures[f.phase] || 0) + 1;
    });
    
    Object.entries(phaseFailures).forEach(([phase, count]) => {
      if (count > 2) {
        patterns.push({
          type: 'phase_concentration',
          phase,
          count,
          severity: 'medium'
        });
      }
    });
    
    return patterns;
  }

  generateSuggestions(failureTypes) {
    const suggestions = [];
    
    if (failureTypes.database?.length > 0) {
      suggestions.push({
        category: 'database',
        action: 'Run database migrations',
        command: 'node supabase/directDatabaseSetup.js'
      });
    }
    
    if (failureTypes.component?.length > 0) {
      suggestions.push({
        category: 'component',
        action: 'Check TypeScript compilation',
        command: 'npm run type-check'
      });
    }
    
    if (failureTypes.permission?.length > 0) {
      suggestions.push({
        category: 'permission',
        action: 'Update RLS policies',
        command: 'Apply migration 005_create_cms_rls_policies.sql'
      });
    }
    
    return suggestions;
  }

  async generateSummary() {
    const results = await this.getTestResults();
    const failures = await this.getFailures();
    const analysis = await this.analyzeFailures();
    
    const summary = {
      timestamp: new Date().toISOString(),
      totals: {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: failures.length,
        autoFixed: results.filter(r => r.autoFixed).length
      },
      phases: this.summarizeByPhase(results),
      failureAnalysis: analysis,
      recentTests: results.slice(-10)
    };
    
    // Create human-readable report
    let report = '🧪 TEST EXECUTION SUMMARY\n';
    report += '========================\n\n';
    
    report += `📊 Overall Results:\n`;
    report += `   Total Tests: ${summary.totals.total}\n`;
    report += `   ✅ Passed: ${summary.totals.passed}\n`;
    report += `   ❌ Failed: ${summary.totals.failed}\n`;
    report += `   🔧 Auto-fixed: ${summary.totals.autoFixed}\n\n`;
    
    report += `📈 Results by Phase:\n`;
    Object.entries(summary.phases).forEach(([phase, data]) => {
      report += `   ${phase}: ${data.passed}/${data.total} passed\n`;
    });
    
    if (analysis.patterns.length > 0) {
      report += `\n⚠️ Patterns Detected:\n`;
      analysis.patterns.forEach(pattern => {
        report += `   - ${pattern.type}: ${pattern.count} occurrences\n`;
      });
    }
    
    if (analysis.suggestions.length > 0) {
      report += `\n💡 Suggested Actions:\n`;
      analysis.suggestions.forEach(suggestion => {
        report += `   - ${suggestion.action}\n`;
        report += `     Command: ${suggestion.command}\n`;
      });
    }
    
    // Save summary
    fs.writeFileSync(
      path.join(__dirname, '..', 'test-summary.txt'),
      report
    );
    
    return summary;
  }

  summarizeByPhase(results) {
    const phases = {};
    
    results.forEach(result => {
      if (!phases[result.phase]) {
        phases[result.phase] = {
          total: 0,
          passed: 0,
          failed: 0,
          avgDuration: 0
        };
      }
      
      phases[result.phase].total++;
      if (result.status === 'PASS' || result.autoFixed) {
        phases[result.phase].passed++;
      } else {
        phases[result.phase].failed++;
      }
      
      phases[result.phase].avgDuration += result.duration || 0;
    });
    
    // Calculate averages
    Object.values(phases).forEach(phase => {
      phase.avgDuration = phase.total > 0 ? 
        (phase.avgDuration / phase.total).toFixed(2) : 0;
    });
    
    return phases;
  }

  clearLogs() {
    fs.writeFileSync(this.logFile, '');
    fs.writeFileSync(this.failureLog, '');
  }
}

export const logger = new TestLogger();