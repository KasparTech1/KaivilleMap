const express = require('express');
const { supabase } = require('../services/research/supabaseClient');
const router = express.Router();

// Debug endpoint to check database schema
router.get('/schema/research_articles', async (req, res) => {
  try {
    console.log('🔍 Checking research_articles table schema...');

    // Test direct table access first
    const { data: testData, error: testError } = await supabase
      .from('research_articles')
      .select('id, title, business_unit, research_domain, analysis_method')
      .limit(1);

    let schemaInfo = {
      timestamp: new Date().toISOString(),
      testQuery: {
        success: !testError,
        error: testError?.message || null,
        recordCount: testData?.length || 0
      },
      columns: []
    };

    if (testError) {
      console.log('❌ Test query failed:', testError.message);
      
      // If specific columns are missing, identify them
      const missingColumns = [];
      if (testError.message.includes('business_unit')) missingColumns.push('business_unit');
      if (testError.message.includes('research_domain')) missingColumns.push('research_domain');
      if (testError.message.includes('analysis_method')) missingColumns.push('analysis_method');
      
      schemaInfo.missingColumns = missingColumns;
      
      // Try basic query without the potentially missing columns
      const { data: basicData, error: basicError } = await supabase
        .from('research_articles')
        .select('id, title, created_at')
        .limit(1);
        
      schemaInfo.basicQuery = {
        success: !basicError,
        error: basicError?.message || null,
        recordCount: basicData?.length || 0,
        sampleRecord: basicData?.[0] || null
      };
    } else {
      console.log('✅ Test query successful');
      schemaInfo.sampleRecord = testData?.[0] || null;
    }

    // Try to get column information from information_schema
    try {
      const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'research_articles')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (!schemaError && columns) {
        schemaInfo.columns = columns;
        
        const expectedColumns = [
          'business_unit', 'research_domain', 'analysis_method', 'report_type', 
          'ai_model', 'generation_template', 'prompt_segments', 'tokens_used', 'generation_time_ms'
        ];
        
        const existingColumns = columns.map(col => col.column_name);
        const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
        
        schemaInfo.analysis = {
          totalColumns: columns.length,
          expectedNewColumns: expectedColumns.length,
          missingColumns: missingColumns,
          allColumnsPresent: missingColumns.length === 0
        };
      }
    } catch (schemaError) {
      console.log('⚠️ Schema query failed:', schemaError.message);
      schemaInfo.schemaQueryError = schemaError.message;
    }

    res.json(schemaInfo);

  } catch (error) {
    console.error('❌ Debug schema check failed:', error);
    res.status(500).json({
      error: 'Schema check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to apply missing columns migration
router.post('/schema/apply-migration', async (req, res) => {
  try {
    console.log('🔧 Applying missing columns migration...');

    // Execute the migration SQL
    const migrationSQL = `
      BEGIN;
      
      ALTER TABLE research_articles 
      ADD COLUMN IF NOT EXISTS business_unit TEXT,
      ADD COLUMN IF NOT EXISTS research_domain TEXT, 
      ADD COLUMN IF NOT EXISTS analysis_method TEXT,
      ADD COLUMN IF NOT EXISTS report_type TEXT,
      ADD COLUMN IF NOT EXISTS ai_model TEXT,
      ADD COLUMN IF NOT EXISTS generation_template TEXT,
      ADD COLUMN IF NOT EXISTS prompt_segments JSONB,
      ADD COLUMN IF NOT EXISTS tokens_used INTEGER,
      ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER;
      
      COMMIT;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Migration applied successfully');

    // Verify the migration worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('research_articles')
      .select('id, business_unit, research_domain, analysis_method')
      .limit(1);

    res.json({
      success: true,
      migrationApplied: true,
      verification: {
        success: !verifyError,
        error: verifyError?.message || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration application failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;