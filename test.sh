#!/bin/bash

# Directory containing the files
DIR="_demos"

# Loop through each file in the directory
for file in "$DIR"/*; do
  # Check if it's a regular file
  if [[ -f "$file" ]]; then
    # Use sed to insert "top: 0px;" after "left: 0px;"
    sed -i '/left: 0px;/a\top: 0px;' "$file"
    echo "Updated $file"
  fi
done
