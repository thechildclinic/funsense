#!/usr/bin/env node

/**
 * Build optimization script for School Health Screening System
 * This script performs additional optimizations after the main build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Optimization tasks
const optimizationTasks = [
  copyStaticAssets,
  generateSitemap,
  optimizeImages,
  generateSecurityHeaders,
  createOfflinePage,
  generateBuildReport
];

// Run all optimization tasks
async function runOptimizations() {
  for (const task of optimizationTasks) {
    try {
      await task();
    } catch (error) {
      console.error(`❌ Optimization task failed:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('✅ Build optimization completed successfully!');
}

// Copy static assets that might be missing
function copyStaticAssets() {
  console.log('📁 Copying static assets...');
  
  const staticFiles = [
    'manifest.json',
    'sw.js',
    'robots.txt'
  ];
  
  staticFiles.forEach(file => {
    const srcPath = path.join(PUBLIC_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied ${file}`);
    }
  });
}

// Generate sitemap.xml
function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.netlify.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  console.log('  ✓ Sitemap generated');
}

// Optimize images (placeholder - would use actual image optimization in production)
function optimizeImages() {
  console.log('🖼️  Optimizing images...');
  
  // In a real implementation, this would:
  // - Compress images
  // - Generate WebP versions
  // - Create responsive image sets
  // - Optimize SVGs
  
  console.log('  ✓ Image optimization completed (placeholder)');
}

// Generate security headers file
function generateSecurityHeaders() {
  console.log('🔒 Generating security headers...');
  
  const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob:; connect-src 'self' https://esm.sh; media-src 'self' blob:

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Headers: Content-Type
  Access-Control-Allow-Methods: GET, POST, OPTIONS

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: public, max-age=0, must-revalidate

/manifest.json
  Cache-Control: public, max-age=86400`;
  
  fs.writeFileSync(path.join(DIST_DIR, '_headers'), headers);
  console.log('  ✓ Security headers generated');
}

// Create offline page
function createOfflinePage() {
  console.log('📱 Creating offline page...');
  
  const offlinePage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - School Health Screening</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color: #334155;
      text-align: center;
      padding: 20px;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #0ea5e9;
      margin-bottom: 1rem;
    }
    .retry-btn {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    .retry-btn:hover {
      background: #0284c7;
    }
  </style>
</head>
<body>
  <div class="offline-icon">📱</div>
  <h1>You're Offline</h1>
  <p>The School Health Screening System is not available right now.</p>
  <p>Please check your internet connection and try again.</p>
  <button class="retry-btn" onclick="window.location.reload()">
    Try Again
  </button>
  
  <script>
    // Auto-retry when back online
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'offline.html'), offlinePage);
  console.log('  ✓ Offline page created');
}

// Generate build report
function generateBuildReport() {
  console.log('📊 Generating build report...');
  
  const buildStats = {
    buildTime: new Date().toISOString(),
    distSize: getDirSize(DIST_DIR),
    files: getFileList(DIST_DIR),
    optimization: {
      minification: true,
      compression: true,
      caching: true,
      pwa: true
    }
  };
  
  fs.writeFileSync(
    path.join(DIST_DIR, 'build-report.json'), 
    JSON.stringify(buildStats, null, 2)
  );
  
  console.log('  ✓ Build report generated');
  console.log(`  📦 Total build size: ${formatBytes(buildStats.distSize)}`);
}

// Utility functions
function getDirSize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

function getFileList(dirPath) {
  const files = [];
  
  function collectFiles(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        collectFiles(fullPath, relPath);
      } else {
        files.push({
          path: relPath,
          size: stats.size
        });
      }
    });
  }
  
  collectFiles(dirPath);
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run optimizations
runOptimizations().catch(console.error);
