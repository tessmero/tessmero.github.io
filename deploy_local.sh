#!/bin/bash

# local version of github workflow
# verify, jekyll build, extra commands 

# verify that demo md files match zip files
if ! bash verify_md_zip.sh; then
    echo "File correspondence check failed. Terminating workflow."
    exit 1
fi

# Start Jekyll server in the background
bundle exec jekyll serve --no-watch &

# Wait for Jekyll to start (adjust sleep time if needed)
sleep 10

# - name: Extract Zipped Games
#   run: |
for zipfile in _zips/*.zip; do
  gamename=$(basename "$zipfile" .zip)
  sudo mkdir -p "_site/iframe/$gamename"
  sudo unzip "$zipfile" -d "_site/iframe/$gamename"
done

# - name: Copy Existing Page to Index.html
#   run: |
homepage=$(grep "^homepage:" _config.yml | awk '{print $2}')
sudo cp "_site/$homepage" _site/index.html
echo "Copied $homepage to index.html"

# Keep the script running to maintain the Jekyll server
wait
