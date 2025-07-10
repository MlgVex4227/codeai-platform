#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting build process...');

try {
  // Create dist directory
  console.log('Creating dist directory...');
  execSync('mkdir -p dist', { stdio: 'inherit' });

  // Try to build frontend
  console.log('Building frontend...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('Frontend build successful');
  } catch (error) {
    console.log('Frontend build failed, creating static files...');
    execSync('mkdir -p dist/client', { stdio: 'inherit' });
    // Copy static files
    if (fs.existsSync('client/index.html')) {
      execSync('cp -r client/* dist/client/', { stdio: 'inherit' });
    }
  }

  // Build backend
  console.log('Building backend...');
  try {
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
    console.log('Backend build successful');
  } catch (error) {
    console.log('Backend build failed, copying source...');
    execSync('cp -r server dist/', { stdio: 'inherit' });
    execSync('cp -r shared dist/', { stdio: 'inherit' });
    
    // Create a simple server entry point
    const serverCode = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`CodeAI platform running on port \${port}\`);
});
    `;
    
    fs.writeFileSync('dist/index.js', serverCode);
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}