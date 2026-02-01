const { createClient } = require('@supabase/supabase-js');

// Direct credentials from Railway env vars file
const supabaseUrl = 'https://yvbtqcmiuymyvtvaqgcf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI5MDc4NywiZXhwIjoyMDY2ODY2Nzg3fQ.3Cc-57O3kQgWhttrxjmgCWn5RUZXTSiQrSfCZzMbBX8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function queryDatabaseSchema() {
  console.log('🔍 Querying research_articles table schema...\n');
  
  try {
    // First, let's query using a raw SQL approach to get column info
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'research_articles' })
      .catch(async () => {
        // Fallback: direct query to information_schema
        return await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', 'research_articles')
          .eq('table_schema', 'public')
          .order('ordinal_position');
      });

    if (schemaError) {
      console.log('⚠️  Schema query via information_schema failed, trying direct SQL...');
      
      // Try raw SQL query
      const { data: sqlResult, error: sqlError } = await supabase
        .from('research_articles')
        .select('*')
        .limit(0); // Just get column structure
        
      if (sqlError) {
        console.error('❌ Raw SQL query error:', sqlError);
      } else {
        console.log('✅ Successfully connected to research_articles table');
      }
    }

    if (columns && columns.length > 0) {
      console.log('📋 Current research_articles table columns:');
      console.log('=' .repeat(70));
      
      const expectedColumns = [
        'business_unit', 'research_domain', 'analysis_method', 'report_type', 
        'ai_model', 'generation_template', 'prompt_segments', 'tokens_used', 'generation_time_ms'
      ];
      
      const existingColumns = columns.map(col => col.column_name);
      
      columns.forEach(col => {
        const isNew = expectedColumns.includes(col.column_name);
        const marker = isNew ? '🆕' : '  ';
        console.log(`${marker} ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      console.log('\n🔍 Missing columns analysis:');
      console.log('=' .repeat(70));
      
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All expected columns are present!');
      } else {
        console.log('❌ Missing columns:');
        missingColumns.forEach(col => {
          console.log(`   - ${col}`);
        });
      }
    }

    // Test a simple select to verify table structure
    console.log('\n🧪 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('research_articles')
      .select('id, title, created_at, business_unit, research_domain')
      .limit(1);

    if (testError) {
      console.error('❌ Table access error:', testError.message);
      
      // If business_unit column doesn't exist, that's our confirmation
      if (testError.message.includes('business_unit') || testError.message.includes('column')) {
        console.log('💡 CONFIRMED: business_unit and related columns are missing from research_articles table');
      }
    } else {
      console.log(`✅ Table access successful. Found ${testData?.length || 0} records.`);
      if (testData && testData.length > 0) {
        const record = testData[0];
        console.log(`   Sample record: ID=${record.id}, Title="${record.title?.substring(0, 50)}..."`);
        console.log(`   business_unit: ${record.business_unit || 'NULL'}`);
        console.log(`   research_domain: ${record.research_domain || 'NULL'}`);
      }
    }

    // Also try to check constraints
    console.log('\n🔐 Checking constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public');

    if (!constraintError && constraints) {
      console.log('📝 Found constraints:');
      constraints.forEach(constraint => {
        const marker = constraint.constraint_name.includes('business_unit') ? '🎯' : '  ';
        console.log(`${marker} ${constraint.constraint_type}: ${constraint.constraint_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  }
}

// Run the query
queryDatabaseSchema().then(() => {
  console.log('\n✅ Database schema check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});