#!/bin/sh
set -eu

spec_file="mobile-leads-tz.md"
template_file="mobile-leads-tz-template.html"
output_file="mobile-leads-tz.html"
spec_hash="$(shasum -a 256 "$spec_file" | awk '{print $1}')"

pandoc "$spec_file" \
  --from=gfm+raw_html \
  --to=html5 \
  --standalone \
  --section-divs \
  --toc \
  --toc-depth=2 \
  --template="$template_file" \
  --variable="spec-hash:$spec_hash" \
  --output="$output_file"

printf '%s\n' "Generated $output_file from $spec_file ($spec_hash)"
