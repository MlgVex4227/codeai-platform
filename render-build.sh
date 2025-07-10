#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building frontend..."
NODE_ENV=production ./node_modules/.bin/vite build

echo "Building backend..."
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"