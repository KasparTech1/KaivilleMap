# 🎯 COMPLETE SUPABASE SETUP GUIDE
## Stop the Cycle Once and For All

> **Save this file as `SUPABASE_SETUP_GUIDE.md` in the `docs/` folder of every Supabase project**

---

## 🚨 THE CORE PROBLEM (Why This Keeps Happening)

**WRONG APPROACH**: Trying to use Supabase JavaScript SDK for schema creation
```javascript
// ❌ This will NEVER work
await supabase.rpc('some_function', { sql: 'CREATE TABLE...' });
```

**CORRECT APPROACH**: Separate tools for different jobs
- 🔧 **Schema Creation**: Direct PostgreSQL or Manual SQL Editor
- 📊 **Data Operations**: Supabase JavaScript SDK

---

## 🛠️ SOLUTION 1: Direct PostgreSQL (WSL-Compatible)

### Fixed Version for WSL IPv6 Issues

```javascript
// supabase-direct-setup.js
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function logStatus(message, type = 'info') {
  const symbols = { success: '✅', error: '❌', warning: '⚠️', info: '📋' };
  const colorMap = { success: colors.green, error: colors.red, warning: colors.yellow, info: colors.blue };
  console.log(`${colorMap[type]}${symbols[type]} ${message}${colors.reset}`);
}

async function createTablesDirectConnection() {
  logStatus('Setting up Supabase tables using direct PostgreSQL connection...', 'info');
  
  // WSL-friendly connection with IPv4 preference
  const connectionConfig = {
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    host: `db.${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    // WSL IPv6 fix
    family: 4, // Force IPv4
    keepAlive: true,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  };
  
  logStatus(`Connecting to: db.${process.env.SUPABASE_PROJECT_ID}.supabase.co (IPv4)`, 'info');
  
  const client = new pg.Client(connectionConfig);

  try {
    await client.connect();
    logStatus('Connected to Supabase database!', 'success');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'docs', 'planning', 'database-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    logStatus(`Read schema file: ${schemaPath}`, 'success');

    logStatus('Executing schema SQL...', 'info');
    await client.query(schemaSql);
    logStatus('Schema executed successfully!', 'success');

    // Test by creating a simple record
    logStatus('Testing table creation with a test record...', 'info');
    
    const testResult = await client.query(`
      INSERT INTO app_settings (setting_key, setting_value, description, category, is_public) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, setting_key
    `, ['test_setup_complete', '"true"', 'Test that setup completed successfully', 'system', false]);
    
    logStatus(`Test record created with ID: ${testResult.rows[0].id}`, 'success');

    // Clean up test record
    await client.query('DELETE FROM app_settings WHERE setting_key = $1', ['test_setup_complete']);
    logStatus('Test record cleaned up', 'success');

    logStatus('🎉 Database setup completed successfully!', 'success');
    
  } catch (error) {
    logStatus(`Database setup failed: ${error.message}`, 'error');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      logStatus('Network connectivity issue detected', 'warning');
      logStatus('💡 Try Solution 2 (Manual) or check your network/WSL setup', 'info');
    }
    
    throw error;
  } finally {
    await client.end();
    logStatus('Database connection closed', 'info');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 SUPABASE SETUP - DIRECT DATABASE CONNECTION (WSL-FIXED)');
  console.log('='.repeat(60));

  try {
    await createTablesDirectConnection();
    
    console.log('\n' + '='.repeat(60));
    logStatus('🎉 COMPLETE SETUP SUCCESS!', 'success');
    logStatus('Your application can now read/write to Supabase tables using the SDK', 'success');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    logStatus('❌ SETUP FAILED', 'error');
    logStatus(`Error: ${error.message}`, 'error');
    
    logStatus('\n📋 Troubleshooting:', 'info');
    logStatus('1. Check your .env file has SUPABASE_DB_PASSWORD set correctly', 'info');
    logStatus('2. Verify SUPABASE_PROJECT_ID matches your project', 'info');
    logStatus('3. If network issues persist, use Solution 2 (Manual)', 'info');
    logStatus('4. For WSL: Try running in Windows PowerShell instead', 'info');
    
    console.log('='.repeat(60));
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  main();
}
```

---

## 🔧 SOLUTION 2: Manual SQL Editor (Always Works)

When network issues prevent direct connection:

### Step 1: Navigate to SQL Editor
```
https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql/new
```

### Step 2: Copy Your Schema
Copy the entire contents of `docs/planning/database-schema.sql`

### Step 3: Execute
Paste and click "RUN" in the SQL Editor

### Step 4: Verify
Run the verification script to confirm success.

---

## ✅ VERIFICATION SCRIPT (Always Run After Setup)

```javascript
// supabase-quick-test.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function logStatus(message, type = 'info') {
  const symbols = { success: '✅', error: '❌', warning: '⚠️', info: '📋' };
  const colorMap = { success: colors.green, error: colors.red, warning: colors.yellow, info: colors.blue };
  console.log(`${colorMap[type]}${symbols[type]} ${message}${colors.reset}`);
}

const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseService = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const requiredTables = [
  'site_content',
  'app_settings', 
  'data_grid_sources',
  'documents',
  'form_submissions',
  'page_analytics',
  'user_preferences'
];

async function testTableExists(tableName, client, keyType) {
  try {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        logStatus(`Table '${tableName}' does not exist (${keyType})`, 'error');
        return false;
      } else {
        logStatus(`Table '${tableName}' access error: ${error.message} (${keyType})`, 'warning');
        return false;
      }
    }

    logStatus(`Table '${tableName}' exists and accessible (${keyType})`, 'success');
    return true;
  } catch (error) {
    logStatus(`Table '${tableName}' test failed: ${error.message} (${keyType})`, 'error');
    return false;
  }
}

async function testWriteCapability() {
  logStatus('Testing write capability...', 'info');

  const testRecord = {
    setting_key: `connection_test_${Date.now()}`,
    setting_value: { test: true, timestamp: new Date().toISOString() },
    description: 'Connection test record - safe to delete',
    category: 'test',
    is_public: false
  };

  try {
    const { data: insertData, error: insertError } = await supabaseService
      .from('app_settings')
      .insert([testRecord])
      .select();

    if (insertError) throw insertError;

    logStatus('✍️  Write test successful!', 'success');

    // Clean up
    await supabaseService
      .from('app_settings')
      .delete()
      .eq('id', insertData[0].id);

    logStatus('🧹 Test record cleaned up', 'success');
    return true;

  } catch (error) {
    logStatus(`Write test failed: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔗 SUPABASE CONNECTION VERIFICATION');
  console.log('='.repeat(70));
  console.log(`🌐 URL: ${colors.blue}${process.env.SUPABASE_URL}${colors.reset}`);
  console.log(`🔑 Project: ${colors.blue}${process.env.SUPABASE_PROJECT_ID}${colors.reset}\n`);

  try {
    // Test with service key
    logStatus('Testing table access with service key...', 'info');
    let serviceAccessCount = 0;
    for (const table of requiredTables) {
      const exists = await testTableExists(table, supabaseService, 'service');
      if (exists) serviceAccessCount++;
    }

    console.log('\n' + '─'.repeat(70));

    // Test write capabilities if tables exist
    if (serviceAccessCount > 0) {
      await testWriteCapability();
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTS SUMMARY');
    console.log('='.repeat(70));

    logStatus(`Tables accessible: ${serviceAccessCount}/${requiredTables.length}`, 
             serviceAccessCount === requiredTables.length ? 'success' : 'warning');

    if (serviceAccessCount === 0) {
      console.log('\n❌ NO TABLES FOUND - SETUP REQUIRED');
      console.log('='.repeat(70));
      console.log(`${colors.yellow}📋 Next Steps:${colors.reset}`);
      console.log(`1. Run: node supabase-direct-setup.js`);
      console.log(`2. OR manually create tables in SQL Editor:`);
      console.log(`   ${colors.blue}${process.env.SUPABASE_URL}/sql/new${colors.reset}`);
      console.log(`3. Copy SQL from: docs/planning/database-schema.sql`);
    } else if (serviceAccessCount === requiredTables.length) {
      console.log('\n🎉 ALL SYSTEMS GO!');
      console.log('='.repeat(70));
      logStatus('Your Supabase setup is complete and working!', 'success');
      logStatus('You can now start your application with confidence', 'success');
    }

    console.log('='.repeat(70));

  } catch (error) {
    logStatus(`Verification failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
```

---

## 📦 REQUIRED PACKAGES

```bash
# Install required dependencies
npm install pg @supabase/supabase-js dotenv

# OR with yarn
yarn add pg @supabase/supabase-js dotenv
```

---

## 🚀 SETUP WORKFLOW (Choose Your Path)

### Path A: Automated (Recommended)
```bash
# 1. Install dependencies
npm install pg @supabase/supabase-js dotenv

# 2. Run direct setup
node supabase-direct-setup.js

# 3. Verify success
node supabase-quick-test.js
```

### Path B: Manual (If Network Issues)
```bash
# 1. Check current status
node supabase-quick-test.js

# 2. If tables missing, go to Supabase SQL Editor:
#    https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new

# 3. Copy contents of docs/planning/database-schema.sql

# 4. Paste and click RUN

# 5. Verify success
node supabase-quick-test.js
```

---

## 🔧 ENVIRONMENT REQUIREMENTS

```env
# Required in .env file
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_DB_PASSWORD=your_db_password
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

---

## 🐛 TROUBLESHOOTING COMMON ISSUES

### Issue 1: "Table does not exist" Error
**Cause**: Tables haven't been created yet
**Solution**: Run setup scripts or manual SQL creation

### Issue 2: WSL IPv6 Network Issues
**Symptoms**: `ENOTFOUND` or `ECONNREFUSED` errors
**Solutions**:
- Use the WSL-fixed script above (forces IPv4)
- Run in Windows PowerShell instead of WSL
- Use manual SQL Editor approach

### Issue 3: Permission Denied
**Cause**: Wrong API key or insufficient permissions
**Solution**: Verify you're using SUPABASE_SERVICE_KEY, not ANON_KEY

### Issue 4: SSL Connection Issues
**Cause**: SSL certificate problems
**Solution**: Connection config includes `ssl: { rejectUnauthorized: false }`

---

## 📚 SUCCESS PATTERNS FROM WORKING PROJECTS

### Pattern 1: Separation of Concerns
- ✅ Schema management: Direct PostgreSQL or manual
- ✅ Data operations: Supabase SDK
- ❌ Never mix schema creation with SDK operations

### Pattern 2: Verification After Setup
Always run verification script after any setup to confirm:
- Tables exist and are accessible
- Read/write operations work
- All required tables are present

### Pattern 3: Environment Consistency
Keep the same `.env` structure across all projects:
```env
SUPABASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_DB_PASSWORD=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

---

## 🎯 WHY THIS GUIDE WORKS

### Root Cause Analysis
1. **Supabase SDK ≠ Full SQL Access**: The SDK is designed for safe CRUD operations
2. **Schema vs Data**: Different tools for different jobs
3. **Network Issues**: WSL and IPv6 can cause connectivity problems
4. **Verification Gap**: Not testing the right things after setup

### This Guide Addresses All Issues
- ✅ Provides working direct PostgreSQL connection (WSL-compatible)
- ✅ Offers manual fallback that always works
- ✅ Includes comprehensive verification
- ✅ Documents troubleshooting for common problems

---

## 🔄 NEVER REPEAT THIS CYCLE

### Save This Guide
Copy this entire guide to `docs/SUPABASE_SETUP_GUIDE.md` in every Supabase project.

### Use These Scripts
Always use the provided scripts instead of trying to "figure it out" again.

### Follow The Pattern
1. Schema creation: Direct PostgreSQL or manual SQL Editor
2. Data operations: Supabase SDK
3. Always verify after setup

### Remember The Core Truth
**Supabase JavaScript SDK is for CRUD operations on existing tables, not for creating tables.**

---

*End of guide. Save this file and never struggle with Supabase setup again!*