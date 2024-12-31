#!/bin/bash

# local version of github workflow
# run local jekyll build, then run extra commands 

# Start Jekyll server in the background
bundle exec jekyll serve &

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
homepage="sketch-ball.html"
sudo cp "_site/$homepage" _site/index.html
echo "Copied $homepage to index.html"

# Keep the script running to maintain the Jekyll server
wait