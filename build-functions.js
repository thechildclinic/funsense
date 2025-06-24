#!/usr/bin/env node

/**
 * Simple build script to compile TypeScript functions when npm is not available
 * This is a fallback for environments where Node.js/npm might not be properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('Building Netlify Functions...');

// Check if TypeScript compiler is available
try {
  require.resolve('typescript');
} catch (error) {
  console.error('TypeScript not found. Please install dependencies first with: npm install');
  process.exit(1);
}

const { execSync } = require('child_process');

try {
  // Create output directory
  const outputDir = path.join(__dirname, 'netlify', 'functions', '.dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Compile TypeScript functions
  console.log('Compiling TypeScript functions...');
  execSync('cd netlify/functions && npx tsc', { stdio: 'inherit' });
  
  console.log('✅ Functions compiled successfully!');
  console.log('Output directory:', outputDir);
  
  // List compiled files
  const files = fs.readdirSync(outputDir);
  console.log('Compiled files:', files);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
