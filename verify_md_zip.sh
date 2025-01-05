#!/bin/bash
# make sure demo data matches demo content

# Set the directories
demos_dir="_demos"
zips_dir="_zips"

# Check if both directories exist
if [ ! -d "$demos_dir" ] || [ ! -d "$zips_dir" ]; then
    echo "Error: One or both directories do not exist."
    exit 1
fi

# Initialize counters
mismatch_count=0
total_files=0

# Loop through .md files in _demos
for md_file in "$demos_dir"/*.md; do
    # Get the base name without extension
    base_name=$(basename "$md_file" .md)
    
    # Check if corresponding .zip file exists
    if [ ! -f "$zips_dir/$base_name.zip" ]; then
        echo "Mismatch: $base_name.md has no corresponding .zip file"
        ((mismatch_count++))
    fi
    
    ((total_files++))
done

# Loop through .zip files in _zips
for zip_file in "$zips_dir"/*.zip; do
    # Get the base name without extension
    base_name=$(basename "$zip_file" .zip)
    
    # Check if corresponding .md file exists
    if [ ! -f "$demos_dir/$base_name.md" ]; then
        echo "Mismatch: $base_name.zip has no corresponding .md file"
        ((mismatch_count++))
    fi
    
    ((total_files++))
done

# Print summary
echo "Total files checked: $total_files"
echo "Mismatches found: $mismatch_count"

# Exit with status code based on mismatches
if [ $mismatch_count -eq 0 ]; then
    echo "All files correspond correctly."
    exit 0
else
    echo "Some files do not correspond."
    exit 1
fi
