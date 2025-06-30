import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_API_URL = 'https://api.supabase.com/v1';
const PROJECT_REF = process.env.SUPABASE_PROJECT_ID;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

/**
 * Execute SQL using Supabase Management API
 */
async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Run database migrations using Management API
 */
async function runMigrations() {
  console.log('🚀 Running database migrations via Supabase Management API...\n');

  const migrations = [
    '002_create_database_schema.sql',
    '003_create_rls_policies.sql'
  ];

  for (const migrationFile of migrations) {
    console.log(`📄 Executing ${migrationFile}...`);
    
    const filePath = path.join(__dirname, 'migrations', migrationFile);
    const sql = await fs.readFile(filePath, 'utf8');

    // Execute the entire migration as one query
    const result = await executeSQL(sql);
    
    if (result.success) {
      console.log(`✅ Successfully executed ${migrationFile}`);
      if (result.result) {
        console.log(`   Result: ${JSON.stringify(result.result).substring(0, 100)}...`);
      }
    } else {
      console.error(`❌ Failed to execute ${migrationFile}: ${result.error}`);
      
      // Try executing statements individually
      console.log('   Attempting to run statements individually...');
      
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim() + ';');

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        // Skip storage-related statements
        if (statement.includes('storage.objects') || statement.includes('storage.buckets')) {
          continue;
        }

        const stmtResult = await executeSQL(statement);
        if (stmtResult.success) {
          successCount++;
          process.stdout.write('.');
        } else {
          errorCount++;
          if (!stmtResult.error.includes('already exists')) {
            console.error(`\n   ❌ Failed: ${statement.substring(0, 50)}...`);
            console.error(`      Error: ${stmtResult.error}`);
          }
        }
      }

      console.log(`\n   Completed: ${successCount} successful, ${errorCount} errors`);
    }
    console.log('');
  }
}

/**
 * Get project information
 */
async function getProjectInfo() {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/projects/${PROJECT_REF}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get project info: ${response.status}`);
    }

    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error getting project info:', error.message);
    return null;
  }
}

/**
 * List database tables
 */
async function listTables() {
  const sql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  const result = await executeSQL(sql);
  
  if (result.success && result.result?.data) {
    return result.result.data.map(row => row.table_name);
  }
  
  return [];
}

/**
 * Main function to set up everything
 */
async function setupDatabase() {
  console.log('🔧 Supabase Database Setup via Management API\n');

  // Check access
  console.log('🔑 Checking API access...');
  const projectInfo = await getProjectInfo();
  
  if (projectInfo) {
    console.log(`✅ Connected to project: ${projectInfo.name || PROJECT_REF}`);
    console.log(`   Region: ${projectInfo.region}`);
    console.log(`   Database: ${projectInfo.database?.host || 'Available'}\n`);
  } else {
    console.error('❌ Failed to connect to project. Check your access token.\n');
    return;
  }

  // List existing tables before migration
  console.log('📋 Checking existing tables...');
  const tablesBefore = await listTables();
  console.log(`   Found ${tablesBefore.length} tables\n`);

  // Run migrations
  await runMigrations();

  // Verify tables after migration
  console.log('🔍 Verifying database setup...');
  const tablesAfter = await listTables();
  
  const expectedTables = ['assets', 'pages', 'page_assets', 'maps', 'categories', 'asset_categories'];
  const createdTables = expectedTables.filter(table => tablesAfter.includes(table));
  
  if (createdTables.length > 0) {
    console.log('✅ Successfully created tables:');
    createdTables.forEach(table => {
      console.log(`   - ${table}`);
    });
  }

  const missingTables = expectedTables.filter(table => !tablesAfter.includes(table));
  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing tables:');
    missingTables.forEach(table => {
      console.log(`   - ${table}`);
    });
  }

  console.log('\n✨ Database setup completed!');
}

// Alternative: Use the SQL Editor endpoint
async function runSQLEditor(sql) {
  try {
    // This endpoint might be available for running SQL
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sql: sql
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Export functions
export { executeSQL, runMigrations, getProjectInfo, listTables, setupDatabase };

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase().catch(console.error);
}