#!/bin/bash

# Supabase credentials from .env.example
SUPABASE_URL="https://yvbtqcmiuymyvtvaqgcf.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YnRxY21pdXlteXZ0dmFxZ2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI5MDc4NywiZXhwIjoyMDY2ODY2Nzg3fQ.3Cc-57O3kQgWhttrxjmgCWn5RUZXTSiQrSfCZzMbBX8"

echo "🔍 Checking research_articles table schema..."
echo ""

# Test 1: Try to select business_unit column (should fail if missing)
echo "Test 1: Checking for business_unit column"
curl -s \
  -X POST \
  "${SUPABASE_URL}/rest/v1/research_articles?select=id,business_unit&limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" > /tmp/test1.json

if grep -q "error" /tmp/test1.json; then
  echo "❌ business_unit column MISSING"
  echo "Error:"
  cat /tmp/test1.json
else
  echo "✅ business_unit column EXISTS"
fi

echo ""

# Test 2: Try basic query without new columns
echo "Test 2: Basic table access"
curl -s \
  -X POST \
  "${SUPABASE_URL}/rest/v1/research_articles?select=id,title,created_at&limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" > /tmp/test2.json

if grep -q "error" /tmp/test2.json; then
  echo "❌ Table access FAILED"
  cat /tmp/test2.json
else
  echo "✅ Table access successful"
  echo "Sample record:"
  cat /tmp/test2.json
fi

echo ""
echo "🔧 Ready to apply migration? The missing columns need to be added to research_articles table."