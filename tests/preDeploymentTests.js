import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PreDeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.criticalChecks = {
      hookOrder: true,
      imports: true,
      typeScript: true,
      buildSuccess: true,
      consoleErrors: true
    };
  }

  async runAllValidations() {
    console.log(chalk.blue.bold('\n🚀 Running Pre-Deployment Validations...\n'));
    
    const checks = [
      this.checkReactHookOrder(),
      this.checkImports(),
      this.checkTypeScriptErrors(),
      this.checkBuildSuccess(),
      this.checkForConsoleErrors(),
      this.checkComponentRender(),
      this.checkMobileResponsiveness()
    ];

    await Promise.all(checks);
    
    return this.generateReport();
  }

  async checkReactHookOrder() {
    console.log(chalk.yellow('🔍 Checking React Hook Order...'));
    
    try {
      // Read all React component files
      const componentFiles = this.getComponentFiles();
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for hooks used before declaration
        const hookUsagePattern = /use[A-Z]\w*\(/g;
        const lines = content.split('\n');
        const declaredHooks = new Set();
        
        lines.forEach((line, index) => {
          // Track hook declarations
          if (line.includes('= use')) {
            const match = line.match(/const\s+\[?(\w+).*=\s+(use\w+)/);
            if (match) {
              declaredHooks.add(match[1]);
            }
          }
          
          // Check for usage before declaration
          const usages = line.match(/(\w+)\./g);
          if (usages) {
            usages.forEach(usage => {
              const varName = usage.replace('.', '');
              if (varName && !declaredHooks.has(varName) && line.includes(varName + '.get')) {
                this.errors.push({
                  file: path.basename(file),
                  line: index + 1,
                  message: `Possible hook usage before declaration: ${varName}`,
                  severity: 'critical'
                });
              }
            });
          }
        });
      }
      
      console.log(chalk.green('✓ Hook order check complete'));
    } catch (error) {
      this.errors.push({
        check: 'hookOrder',
        message: error.message,
        severity: 'critical'
      });
    }
  }

  async checkImports() {
    console.log(chalk.yellow('🔍 Checking Import Statements...'));
    
    try {
      const componentFiles = this.getComponentFiles();
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for circular imports
        const imports = content.match(/import\s+.*from\s+['"](.+)['"]/g) || [];
        
        // Check if all imported files exist
        imports.forEach(imp => {
          const pathMatch = imp.match(/from\s+['"](.+)['"]/);
          if (pathMatch && pathMatch[1].startsWith('.')) {
            const importPath = path.resolve(path.dirname(file), pathMatch[1]);
            const possiblePaths = [
              importPath,
              importPath + '.ts',
              importPath + '.tsx',
              importPath + '.js',
              importPath + '.jsx',
              path.join(importPath, 'index.ts'),
              path.join(importPath, 'index.tsx')
            ];
            
            const exists = possiblePaths.some(p => fs.existsSync(p));
            if (!exists) {
              this.warnings.push({
                file: path.basename(file),
                message: `Import not found: ${pathMatch[1]}`,
                severity: 'warning'
              });
            }
          }
        });
      }
      
      console.log(chalk.green('✓ Import check complete'));
    } catch (error) {
      this.errors.push({
        check: 'imports',
        message: error.message,
        severity: 'high'
      });
    }
  }

  async checkTypeScriptErrors() {
    console.log(chalk.yellow('🔍 Checking TypeScript Compilation...'));
    
    try {
      const clientDir = path.join(process.cwd(), 'client');
      
      // Run TypeScript compiler in check mode
      execSync('npx tsc --noEmit', {
        cwd: clientDir,
        stdio: 'pipe'
      });
      
      console.log(chalk.green('✓ TypeScript check passed'));
    } catch (error) {
      // Parse TypeScript errors
      const output = error.stdout?.toString() || error.message;
      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      
      errorLines.forEach(line => {
        this.errors.push({
          check: 'typeScript',
          message: line,
          severity: 'critical'
        });
      });
      
      if (errorLines.length === 0) {
        // If no specific TS errors, still record the failure
        this.warnings.push({
          check: 'typeScript',
          message: 'TypeScript compilation warnings detected',
          severity: 'medium'
        });
      }
    }
  }

  async checkBuildSuccess() {
    console.log(chalk.yellow('🔍 Testing Production Build...'));
    
    try {
      const clientDir = path.join(process.cwd(), 'client');
      
      // Clean previous build
      const distPath = path.join(clientDir, 'dist');
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true });
      }
      
      // Run build
      execSync('npm run build', {
        cwd: clientDir,
        stdio: 'pipe'
      });
      
      // Check if build output exists
      if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
        throw new Error('Build output not found');
      }
      
      console.log(chalk.green('✓ Build successful'));
    } catch (error) {
      this.errors.push({
        check: 'buildSuccess',
        message: error.message || 'Build failed',
        severity: 'critical'
      });
    }
  }

  async checkForConsoleErrors() {
    console.log(chalk.yellow('🔍 Checking for Console Errors...'));
    
    try {
      const componentFiles = this.getComponentFiles();
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for console.error or console.log left in code
        const consoleMatches = content.match(/console\.(log|error|warn)\(/g) || [];
        
        if (consoleMatches.length > 0) {
          this.warnings.push({
            file: path.basename(file),
            message: `Found ${consoleMatches.length} console statements`,
            severity: 'low'
          });
        }
      }
      
      console.log(chalk.green('✓ Console check complete'));
    } catch (error) {
      this.warnings.push({
        check: 'consoleErrors',
        message: error.message,
        severity: 'low'
      });
    }
  }

  async checkComponentRender() {
    console.log(chalk.yellow('🔍 Checking Component Render Safety...'));
    
    try {
      const componentFiles = this.getComponentFiles();
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for conditional hooks (common mistake)
        if (content.match(/if\s*\([^)]*\)\s*{[^}]*use[A-Z]/)) {
          this.errors.push({
            file: path.basename(file),
            message: 'Conditional hook usage detected',
            severity: 'critical'
          });
        }
        
        // Check for missing key props in lists
        if (content.includes('.map(') && !content.includes('key=')) {
          this.warnings.push({
            file: path.basename(file),
            message: 'Possible missing key prop in list rendering',
            severity: 'medium'
          });
        }
      }
      
      console.log(chalk.green('✓ Component render check complete'));
    } catch (error) {
      this.errors.push({
        check: 'componentRender',
        message: error.message,
        severity: 'high'
      });
    }
  }

  async checkMobileResponsiveness() {
    console.log(chalk.yellow('🔍 Checking Mobile Responsiveness...'));
    
    try {
      const componentFiles = this.getComponentFiles();
      let mobileOptimized = 0;
      let needsWork = 0;
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for responsive classes
        const hasResponsive = content.includes('md:') || content.includes('lg:') || 
                             content.includes('sm:') || content.includes('@media');
        
        // Check for mobile-specific handling
        const hasMobileLogic = content.includes('mobile') || content.includes('touch') ||
                              content.includes('swipe') || content.includes('viewport');
        
        if (hasResponsive || hasMobileLogic) {
          mobileOptimized++;
        } else if (content.includes('className')) {
          needsWork++;
        }
      }
      
      if (needsWork > mobileOptimized) {
        this.warnings.push({
          check: 'mobileResponsiveness',
          message: `${needsWork} components may need mobile optimization`,
          severity: 'medium'
        });
      }
      
      console.log(chalk.green('✓ Mobile responsiveness check complete'));
    } catch (error) {
      this.warnings.push({
        check: 'mobileResponsiveness',
        message: error.message,
        severity: 'low'
      });
    }
  }

  getComponentFiles() {
    const clientSrc = path.join(process.cwd(), 'client', 'src');
    const files = [];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules')) {
          scanDir(fullPath);
        } else if (item.match(/\.(tsx?|jsx?)$/)) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(clientSrc);
    return files;
  }

  generateReport() {
    const hasCriticalErrors = this.errors.some(e => e.severity === 'critical');
    const totalIssues = this.errors.length + this.warnings.length;
    
    console.log(chalk.blue('\n📋 Pre-Deployment Report\n'));
    console.log(chalk.white(`Total Issues: ${totalIssues}`));
    console.log(chalk.red(`Errors: ${this.errors.length}`));
    console.log(chalk.yellow(`Warnings: ${this.warnings.length}`));
    
    if (this.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      this.errors.forEach(error => {
        console.log(chalk.red(`  - [${error.severity}] ${error.message}`));
        if (error.file) console.log(chalk.red(`    File: ${error.file}`));
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      this.warnings.forEach(warning => {
        console.log(chalk.yellow(`  - [${warning.severity}] ${warning.message}`));
        if (warning.file) console.log(chalk.yellow(`    File: ${warning.file}`));
      });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      warnings: this.warnings,
      hasCriticalErrors,
      totalIssues,
      canDeploy: !hasCriticalErrors
    };
    
    // Save report
    fs.writeFileSync(
      path.join(process.cwd(), 'tests', 'pre-deployment-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    if (hasCriticalErrors) {
      console.log(chalk.red.bold('\n🚫 DEPLOYMENT BLOCKED: Critical errors must be fixed!'));
      process.exit(1);
    } else if (this.errors.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  DEPLOYMENT WARNING: Non-critical errors detected'));
    } else {
      console.log(chalk.green.bold('\n✅ READY TO DEPLOY: All critical checks passed!'));
    }
    
    return report;
  }
}

// Auto-run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const validator = new PreDeploymentValidator();
  validator.runAllValidations();
}