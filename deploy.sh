#!/bin/bash

# Stop script on any error
set -e

# Fetch the latest code from GitHub
git pull origin master

# Install dependencies
npm install

# Build the app
npm run build

pm2 startOrRestart ecosystem.config.js

echo "Deployment complete."