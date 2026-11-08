#!/usr/bin/env bash
# Builds output/<SEAT>_<NAME>_QA.docx (and .pdf if LibreOffice is installed) from report-data.json.
# Needs: Node.js with `docx` (npm i docx), Python 3 with matplotlib + pillow, and Mermaid CLI (npm i -g @mermaid-js/mermaid-cli).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build output

for d in diagrams/*.mmd; do
  name=$(basename "$d" .mmd)
  mmdc -q -i "$d" -o "build/$name.png" -b white -s 3 -t neutral
done
python3 scripts/prepare_assets.py
DOCX=$(node scripts/build_report.js)
echo "Word file: $DOCX"

if command -v soffice >/dev/null 2>&1; then
  python3 scripts/docx_to_pdf.py "$DOCX"
else
  echo "LibreOffice not found: open the .docx in Word, right-click the Table of Contents > Update Field, then File > Save As > PDF."
fi
