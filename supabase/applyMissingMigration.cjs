const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs/promises');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create admin client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Apply the 010_align_research_generator_fields.sql migration
 * This migration adds business_unit and other Research Generator fields
 */
async function applyResearchGeneratorMigration() {
  console.log('🚀 Applying Research Generator Migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '010_align_research_generator_fields.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    let migrationSQL;
    try {
      migrationSQL = await fs.readFile(migrationPath, 'utf8');
      console.log(`✅ Migration file loaded (${migrationSQL.length} characters)`);
    } catch (fileError) {
      console.error('❌ Could not read migration file:', fileError.message);
      console.log('\n💡 Make sure the file exists at:');
      console.log('   /supabase/migrations/010_align_research_generator_fields.sql');
      return false;
    }
    
    // Check current table structure first
    console.log('\n🔍 Checking current table structure...');
    const { data: currentColumns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public');
    
    if (schemaError) {
      console.error('❌ Could not check current schema:', schemaError.message);
      return false;
    }
    
    if (!currentColumns || currentColumns.length === 0) {
      console.error('❌ research_articles table not found');
      return false;
    }
    
    const existingColumnNames = currentColumns.map(col => col.column_name);
    console.log(`✅ Found ${existingColumnNames.length} existing columns`);
    
    // Check which new columns are missing
    const expectedNewColumns = [
      'business_unit', 'research_domain', 'analysis_method', 'report_type',
      'ai_model', 'generation_template', 'prompt_segments', 'tokens_used', 'generation_time_ms'
    ];
    
    const missingColumns = expectedNewColumns.filter(col => !existingColumnNames.includes(col));
    const existingNewColumns = expectedNewColumns.filter(col => existingColumnNames.includes(col));
    
    if (existingNewColumns.length > 0) {
      console.log(`ℹ️  Already applied columns: ${existingNewColumns.join(', ')}`);
    }
    
    if (missingColumns.length === 0) {
      console.log('\n✅ Migration already applied! All columns exist.');
      return true;
    }
    
    console.log(`\n⚠️  Missing columns: ${missingColumns.join(', ')}`);
    console.log('\n🔧 Applying migration...');
    
    // Method 1: Try using Supabase SQL execution function (if available)
    try {
      const { data, error } = await supabase.rpc('exec', { sql: migrationSQL });
      
      if (!error) {
        console.log('✅ Migration applied successfully via RPC!');
        return await verifyMigration();
      } else {
        console.log('⚠️  RPC method failed, trying alternative...');
      }
    } catch (rpcError) {
      console.log('⚠️  RPC method not available, trying alternative...');
    }
    
    // Method 2: Try REST API approach
    try {
      console.log('🔧 Attempting REST API execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(/;\s*$/gm)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT');
      
      console.log(`📋 Found ${statements.length} SQL statements to execute`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`\n📝 Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          // Use fetch to execute raw SQL
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (response.ok) {
            console.log('✅ Success');
            successCount++;
          } else {
            const errorText = await response.text();
            console.log(`❌ Failed: ${errorText}`);
            errorCount++;
            
            // If it's just a "column already exists" error, that's OK
            if (errorText.includes('already exists')) {
              console.log('ℹ️  Column already exists - continuing...');
              successCount++;
              errorCount--;
            }
          }
        } catch (execError) {
          console.log(`❌ Error: ${execError.message}`);
          errorCount++;
        }
      }
      
      console.log(`\n📊 Execution Summary: ${successCount} successful, ${errorCount} errors`);
      
      if (errorCount === 0 || successCount > errorCount) {
        console.log('✅ Migration appears to have been applied successfully');
        return await verifyMigration();
      } else {
        console.log('❌ Migration failed with too many errors');
        return false;
      }
      
    } catch (restError) {
      console.error('❌ REST API execution failed:', restError.message);
    }
    
    // Method 3: Provide manual instructions
    console.log('\n💡 MANUAL MIGRATION REQUIRED');
    console.log('============================================');
    console.log('The migration could not be applied automatically.');
    console.log('Please apply it manually using one of these methods:');
    console.log('');
    console.log('1. SUPABASE DASHBOARD:');
    console.log('   - Go to your Supabase Dashboard');
    console.log('   - Navigate to SQL Editor');
    console.log('   - Copy and paste the contents of:');
    console.log('     /supabase/migrations/010_align_research_generator_fields.sql');
    console.log('   - Click "Run"');
    console.log('');
    console.log('2. SUPABASE CLI:');
    console.log('   - Install CLI: npm install -g supabase');
    console.log('   - Login: supabase login');
    console.log('   - Link project: supabase link --project-ref YOUR_PROJECT_REF');
    console.log('   - Run: supabase db push');
    console.log('');
    console.log('3. DIRECT psql CONNECTION:');
    console.log(`   - psql "postgresql://postgres:[PASSWORD]@db.${process.env.SUPABASE_PROJECT_ID || 'YOUR_PROJECT'}.supabase.co:5432/postgres"`);
    console.log('   - Copy and paste the migration SQL');
    console.log('');
    console.log('📄 Migration file location:');
    console.log(`   ${migrationPath}`);
    
    return false;
    
  } catch (error) {
    console.error('❌ Unexpected error applying migration:', error);
    return false;
  }
}

/**
 * Verify that the migration was applied successfully
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration was applied...');
  
  try {
    // Check if all expected columns now exist
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Could not verify columns:', error.message);
      return false;
    }
    
    const columnNames = columns.map(col => col.column_name);
    
    const expectedColumns = [
      'business_unit', 'research_domain', 'analysis_method', 'report_type',
      'ai_model', 'generation_template', 'prompt_segments', 'tokens_used', 'generation_time_ms'
    ];
    
    const stillMissing = expectedColumns.filter(col => !columnNames.includes(col));
    
    if (stillMissing.length === 0) {
      console.log('✅ Migration verification SUCCESS! All columns are present.');
      
      // Try a test query with new columns
      const { data: testData, error: testError } = await supabase
        .from('research_articles')
        .select('id, business_unit, research_domain')
        .limit(1);
      
      if (!testError) {
        console.log('✅ New columns are queryable');
        return true;
      } else {
        console.log('⚠️  Columns exist but may have query issues:', testError.message);
        return true; // Still consider it successful if columns exist
      }
    } else {
      console.log(`❌ Migration verification FAILED. Still missing: ${stillMissing.join(', ')}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    return false;
  }
}

/**
 * Show current migration status and next steps
 */
async function showMigrationStatus() {
  console.log('📊 CURRENT MIGRATION STATUS');
  console.log('=====================================');
  
  try {
    // Check which columns exist
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error || !columns) {
      console.log('❌ Could not check table status');
      return;
    }
    
    const columnNames = columns.map(col => col.column_name);
    
    const requiredColumns = [
      'business_unit', 'research_domain', 'analysis_method', 'report_type',
      'ai_model', 'generation_template', 'prompt_segments', 'tokens_used', 'generation_time_ms'
    ];
    
    const existing = requiredColumns.filter(col => columnNames.includes(col));
    const missing = requiredColumns.filter(col => !columnNames.includes(col));
    
    console.log(`\nTable: research_articles`);
    console.log(`Total columns: ${columnNames.length}`);
    console.log(`Required migration columns: ${existing.length}/${requiredColumns.length}`);
    
    if (existing.length > 0) {
      console.log(`\n✅ Existing columns:`);
      existing.forEach(col => console.log(`   - ${col}`));
    }
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing columns:`);
      missing.forEach(col => console.log(`   - ${col}`));
    }
    
    console.log(`\nMigration status: ${missing.length === 0 ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    
    if (missing.length > 0) {
      console.log('\n🔧 Run this script to apply the migration:');
      console.log('   node supabase/applyMissingMigration.js');
    }
    
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    await showMigrationStatus();
  } else {
    const success = await applyResearchGeneratorMigration();
    
    if (success) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('You can now use the Research Generator with business_unit and other new fields.');
    } else {
      console.log('\n❌ Migration failed or requires manual intervention.');
      console.log('Please follow the manual migration instructions above.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  applyResearchGeneratorMigration,
  verifyMigration,
  showMigrationStatus
};