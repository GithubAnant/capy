#!/bin/bash

LOG_DIR="$HOME/.claude"
TODAY=$(date +%Y-%m-%d)
TOTAL=0

find "$LOG_DIR" -type f -name "*.json" 2>/dev/null | while read file; do
  jq -c 'select(.input_tokens != null)' "$file" 2>/dev/null | while read line; do
    DATE=$(echo "$line" | jq -r '.timestamp' | cut -d'T' -f1)
    
    if [ "$DATE" = "$TODAY" ]; then
      INPUT=$(echo "$line" | jq -r '.input_tokens')
      OUTPUT=$(echo "$line" | jq -r '.output_tokens')
      TOTAL=$((TOTAL + INPUT + OUTPUT))
    fi
  done
done

echo "Today's token usage: $TOTAL"
