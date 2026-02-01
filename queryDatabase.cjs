const { supabase } = require('./server/services/research/supabaseClient');

async function queryDatabaseSchema() {
  console.log('🔍 Querying research_articles table schema...\n');
  
  try {
    // Query the information_schema to get all columns for research_articles table
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (schemaError) {
      console.error('❌ Schema query error:', schemaError);
      return;
    }

    console.log('📋 Current research_articles table columns:');
    console.log('=' .repeat(60));
    
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
    console.log('=' .repeat(60));
    
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All expected columns are present!');
    } else {
      console.log('❌ Missing columns:');
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
      });
    }

    // Also check constraints
    console.log('\n🔐 Checking table constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'research_articles')
      .eq('table_schema', 'public');

    if (!constraintError && constraints) {
      constraints.forEach(constraint => {
        console.log(`   ${constraint.constraint_type}: ${constraint.constraint_name}`);
      });
    }

    // Test a simple select to verify connection
    console.log('\n🧪 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('research_articles')
      .select('id, title, created_at')
      .limit(1);

    if (testError) {
      console.error('❌ Table access error:', testError);
    } else {
      console.log(`✅ Table access successful. Found ${testData?.length || 0} records.`);
      if (testData && testData.length > 0) {
        console.log(`   Sample record: ID=${testData[0].id}, Title="${testData[0].title}"`);
      }
    }

  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    console.error('   Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment');
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