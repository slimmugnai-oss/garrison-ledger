#!/bin/bash
echo "🚀 Processing all Priority 1 research files..."
echo ""

for file in "research/priority-1"/*.md; do
  if [[ "$file" == *"README"* ]]; then
    continue
  fi
  
  if [[ "$file" == *"Military Financial Planning Deep Dive"* ]]; then
    echo "⏭️  Skipping (already processed): $(basename "$file")"
    continue
  fi
  
  echo "📄 Processing: $(basename "$file")"
  
  # Copy to research root temporarily
  cp "$file" "research/current-processing.md"
  
  # Run extraction
  NEXT_PUBLIC_SUPABASE_URL=https://dxurafcnscbwcfgxygmm.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXJhZmNuc2Nid2NmZ3h5Z21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkzMjMxOCwiZXhwIjoyMDc1NTA4MzE4fQ.Ph0v5716rTTiCLskd-0HcwYtZ4EkQKN_jWBLfUysnhY \
  npx tsx scripts/extract-and-ingest-single-file.ts "research/current-processing.md" 2>&1 | tail -5
  
  echo ""
done

echo "✅ All research files processed!"
rm -f research/current-processing.md
