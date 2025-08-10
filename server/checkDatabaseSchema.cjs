// Use the existing supabase client from the research service
const { supabase } = require('./services/research/supabaseClient');

/**
 * Check what columns exist in the research_articles table
 */
async function checkTableSchema(tableName) {
  console.log(`\n🔍 Checking schema for table: ${tableName}`);
  
  try {
    // Method 1: Query information_schema
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (schemaError) {
      console.log('❌ Could not query information_schema:', schemaError.message);
      console.log('Trying alternative method...');
      
      // Method 2: Try to select a single record to see column structure
      const { data: sampleRecord, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (sampleError) {
        if (sampleError.code === '42P01') {
          console.log(`❌ Table '${tableName}' does not exist`);
          return { exists: false, columns: [] };
        }
        console.log('❌ Error accessing table:', sampleError.message);
        return { exists: false, columns: [], error: sampleError.message };
      }
      
      if (sampleRecord && sampleRecord.length > 0) {
        const columnNames = Object.keys(sampleRecord[0]);
        console.log(`✅ Table exists with ${columnNames.length} columns (from sample record)`);
        columnNames.forEach(col => console.log(`   - ${col}`));
        return { exists: true, columns: columnNames, method: 'sample_record' };
      } else {
        console.log(`✅ Table exists but is empty. Cannot determine column structure.`);
        return { exists: true, columns: [], method: 'empty_table' };
      }
    }
    
    if (columns && columns.length > 0) {
      console.log(`✅ Table exists with ${columns.length} columns (from information_schema)`);
      console.log('\n📋 Column Details:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      return { 
        exists: true, 
        columns: columns.map(c => c.column_name), 
        columnDetails: columns,
        method: 'information_schema'
      };
    } else {
      console.log(`❌ No columns found for table '${tableName}' - table may not exist`);
      return { exists: false, columns: [] };
    }
    
  } catch (error) {
    console.error('❌ Unexpected error checking schema:', error);
    return { exists: false, columns: [], error: error.message };
  }
}

/**
 * Check if specific columns exist in a table
 */
async function checkSpecificColumns(tableName, expectedColumns) {
  console.log(`\n🎯 Checking for specific columns in ${tableName}:`);
  expectedColumns.forEach(col => console.log(`   - ${col}`));
  
  const schema = await checkTableSchema(tableName);
  
  if (!schema.exists) {
    return { missing: expectedColumns, existing: [] };
  }
  
  const existing = [];
  const missing = [];
  
  expectedColumns.forEach(col => {
    if (schema.columns.includes(col)) {
      existing.push(col);
      console.log(`   ✅ ${col}`);
    } else {
      missing.push(col);
      console.log(`   ❌ ${col} - MISSING`);
    }
  });
  
  return { missing, existing, totalColumns: schema.columns };
}

/**
 * Check database connectivity and basic info
 */
async function checkDatabaseConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('pg_stat_database')
      .select('datname')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Get database version
    const { data: version, error: versionError } = await supabase
      .rpc('version');
    
    if (!versionError && version) {
      console.log('📊 Database version:', version);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

/**
 * List all tables in the public schema
 */
async function listAllTables() {
  console.log('\n📊 Listing all tables in public schema...');
  
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.log('❌ Could not list tables:', error.message);
      return [];
    }
    
    if (tables && tables.length > 0) {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(table => console.log(`   - ${table.table_name}`));
      return tables.map(t => t.table_name);
    } else {
      console.log('❌ No tables found in public schema');
      return [];
    }
  } catch (error) {
    console.log('❌ Error listing tables:', error.message);
    return [];
  }
}

/**
 * Execute raw SQL to check for migration status
 */
async function checkMigrationStatus() {
  console.log('\n🔧 Checking migration status...');
  
  try {
    // Check if there's a migrations table or similar tracking
    const migrationTables = ['schema_migrations', 'migrations', 'supabase_migrations'];
    
    for (const migTable of migrationTables) {
      try {
        const { data, error } = await supabase
          .from(migTable)
          .select('*')
          .limit(5);
          
        if (!error) {
          console.log(`✅ Found migration tracking table: ${migTable}`);
          if (data && data.length > 0) {
            console.log(`   Recent migrations:`);
            data.forEach(migration => {
              console.log(`   - ${migration.version || migration.name || migration.id} (${migration.executed_at || migration.created_at || 'unknown date'})`);
            });
          }
          return migTable;
        }
      } catch (err) {
        // Table doesn't exist, continue
      }
    }
    
    console.log('⚠️  No standard migration tracking table found');
    return null;
  } catch (error) {
    console.log('❌ Error checking migration status:', error.message);
    return null;
  }
}

/**
 * Test if we can insert/update research_articles with new fields
 */
async function testArticleOperations() {
  console.log('\n🧪 Testing research_articles operations...');
  
  try {
    // First check if table exists and get its structure
    const schema = await checkTableSchema('research_articles');
    
    if (!schema.exists) {
      console.log('❌ research_articles table does not exist');
      return false;
    }
    
    // Try to select from the table
    const { data: articles, error: selectError } = await supabase
      .from('research_articles')
      .select('id, title, created_at')
      .limit(3);
    
    if (selectError) {
      console.log('❌ Cannot select from research_articles:', selectError.message);
      return false;
    }
    
    console.log(`✅ Can read from research_articles (${articles?.length || 0} records found)`);
    
    // Check if we can find articles with new fields
    if (schema.columns.includes('business_unit')) {
      const { data: articlesWithBU, error: buError } = await supabase
        .from('research_articles')
        .select('id, business_unit, research_domain, analysis_method')
        .not('business_unit', 'is', null)
        .limit(1);
      
      if (!buError) {
        console.log(`✅ Can query new fields. Found ${articlesWithBU?.length || 0} articles with business_unit set`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error testing operations:', error.message);
    return false;
  }
}

/**
 * Comprehensive database schema check
 */
async function runComprehensiveCheck() {
  console.log('🚀 Starting comprehensive database schema check...\n');
  console.log(`📅 Check performed at: ${new Date().toLocaleString()}`);
  console.log(`🌐 Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`🔑 Service key configured: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  
  // Check basic connectivity
  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Database connection failed. Please check your environment variables and Supabase configuration.');
    return;
  }
  
  // List all tables
  const allTables = await listAllTables();
  
  // Check migration status
  await checkMigrationStatus();
  
  // Check research_articles table specifically
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESEARCH_ARTICLES TABLE ANALYSIS');
  console.log('='.repeat(60));
  
  const researchArticlesSchema = await checkTableSchema('research_articles');
  
  // Expected columns from migration 010_align_research_generator_fields.sql
  const expectedNewColumns = [
    'business_unit',
    'research_domain', 
    'analysis_method',
    'report_type',
    'ai_model',
    'generation_template',
    'prompt_segments',
    'tokens_used',
    'generation_time_ms'
  ];
  
  console.log('\n🔍 Checking for Research Generator fields...');
  const columnCheck = await checkSpecificColumns('research_articles', expectedNewColumns);
  
  if (columnCheck.missing.length > 0) {
    console.log(`\n❌ MIGRATION NEEDED: Missing ${columnCheck.missing.length} columns:`);
    columnCheck.missing.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n💡 SOLUTION STEPS:');
    console.log('1. The migration 010_align_research_generator_fields.sql was not applied');
    console.log('2. You need to run this migration manually via:');
    console.log('   a) Supabase Dashboard > SQL Editor > paste the migration SQL');
    console.log('   b) Supabase CLI: supabase db push');
    console.log('   c) Direct psql connection');
    console.log('\n📄 Migration file location:');
    console.log('   /supabase/migrations/010_align_research_generator_fields.sql');
  } else {
    console.log('\n✅ All Research Generator fields are present!');
  }
  
  // Test operations
  await testArticleOperations();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Database Connection: ${connectionOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Total Tables Found: ${allTables.length}`);
  console.log(`Research Articles Table: ${researchArticlesSchema.exists ? '✅ EXISTS' : '❌ MISSING'}`);
  
  if (researchArticlesSchema.exists) {
    console.log(`Total Columns: ${researchArticlesSchema.columns.length}`);
    console.log(`Missing Generator Fields: ${columnCheck.missing.length}`);
    console.log(`Migration Status: ${columnCheck.missing.length === 0 ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  }
  
  if (columnCheck.missing.length > 0) {
    console.log('\n⚠️  ACTION REQUIRED: Apply migration 010_align_research_generator_fields.sql');
  } else {
    console.log('\n🎉 Database schema is up to date!');
  }
}

// Run the check if called directly
if (require.main === module) {
  runComprehensiveCheck().catch(console.error);
}

module.exports = {
  checkTableSchema,
  checkSpecificColumns,
  checkDatabaseConnection,
  listAllTables,
  checkMigrationStatus,
  testArticleOperations,
  runComprehensiveCheck
};