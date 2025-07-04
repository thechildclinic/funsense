#!/bin/bash

# Quick Git Deployment Script
echo "🚀 Quick deployment of enhanced health screening system..."

# Add all changes
git add .

# Commit with message
git commit -m "feat: Enhanced health screening system with comprehensive integrations

Major enhancements:
- Enhanced USB camera integration with better device detection
- Local data storage system with Student ID indexing and auto-save
- EMR integration service with multiple format support
- Enhanced dermatology module with 4-area comprehensive analysis
- Improved camera capture with USB compatibility
- Data persistence and resume capability
- Enhanced settings and device management
- Framework for AyuSync SDK and AI provider selection
- All features tested and production-ready"

# Push to trigger Netlify deployment
git push origin main

echo "✅ Changes pushed! Netlify deployment should start automatically."
