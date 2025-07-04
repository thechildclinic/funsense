# 🚀 Deployment Guide - Health Screening System

## 📋 Repository Setup Instructions

### 🔄 Pushing Code to Your Repository

Since I don't have direct access to your repository, here are the exact commands you need to run:

#### 1. Navigate to Project Directory
```bash
cd /path/to/nurse-health-monitor-pro-2
```

#### 2. Add Your Repository as Remote
```bash
# Add your repository as a new remote
git remote add skids https://github.com/satishskid/skidscameraAIscreen.git

# Verify remotes
git remote -v
```

#### 3. Push to Your Repository
```bash
# Push all code to your repository
git push skids main

# If you get permission errors, you may need to authenticate
# Use GitHub CLI or personal access token
```

#### 4. Alternative: Clone and Copy Method
If direct push doesn't work, use this method:

```bash
# 1. Clone your empty repository
git clone https://github.com/satishskid/skidscameraAIscreen.git
cd skidscameraAIscreen

# 2. Copy all files from the current project
cp -r /path/to/nurse-health-monitor-pro-2/* .
cp -r /path/to/nurse-health-monitor-pro-2/.* . 2>/dev/null || true

# 3. Initialize git and commit
git add .
git commit -m "Initial commit: Complete Health Screening System

🏥 Features:
- Complete 6-step screening workflow
- AI integration (Gemini, OpenAI, Claude, Local)
- Professional print functionality
- Emergency navigation system
- USB camera integration
- Local data storage
- EMR integration ready

🚀 Ready for production deployment"

# 4. Push to your repository
git push origin main
```

---

## 🌐 Netlify Deployment Setup

### 1. Connect Repository to Netlify

#### Option A: Netlify Dashboard
```
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Choose "GitHub"
4. Select "satishskid/skidscameraAIscreen"
5. Configure build settings:
   - Build command: npm run netlify:build
   - Publish directory: dist
   - Functions directory: netlify/functions/.dist
6. Click "Deploy site"
```

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### 2. Environment Variables Setup

#### Required Environment Variables
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
NODE_VERSION=18
```

#### Getting API Keys

**Google Gemini API Key:**
```
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key
4. Add to Netlify environment variables
```

**OpenAI API Key (Optional):**
```
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add as OPENAI_API_KEY in Netlify
```

**Anthropic Claude API Key (Optional):**
```
1. Go to https://console.anthropic.com/
2. Generate API key
3. Add as CLAUDE_API_KEY in Netlify
```

### 3. Build Configuration

#### netlify.toml (Already included)
```toml
[build]
  command = "npm run netlify:build"
  functions = "netlify/functions/.dist"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 🔧 Local Development Setup

### 1. Prerequisites
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Install if needed
# Download from: https://nodejs.org/
```

### 2. Project Setup
```bash
# Clone your repository
git clone https://github.com/satishskid/skidscameraAIscreen.git
cd skidscameraAIscreen

# Install dependencies
npm install

# Install function dependencies
cd netlify/functions
npm install
cd ../..
```

### 3. Environment Configuration
```bash
# Create local environment file
touch .env.local

# Add your API keys
echo "VITE_GEMINI_API_KEY=your_gemini_api_key" >> .env.local
echo "API_KEY=your_gemini_api_key" >> .env.local
```

### 4. Development Server
```bash
# Start development server
npm run dev

# Server will start on http://localhost:5700
# Open in browser to test locally
```

### 5. Build and Test
```bash
# Build functions
npm run build:functions

# Build entire project
npm run netlify:build

# Test build locally
npm run preview
```

---

## 📱 Production Deployment Checklist

### Pre-Deployment
```
✅ Code pushed to GitHub repository
✅ Environment variables configured in Netlify
✅ API keys tested and working
✅ Build process tested locally
✅ All features tested in development
✅ Documentation updated
```

### Deployment Steps
```
✅ Connect repository to Netlify
✅ Configure build settings
✅ Set environment variables
✅ Deploy and test
✅ Configure custom domain (optional)
✅ Enable HTTPS (automatic)
✅ Test all functionality
```

### Post-Deployment
```
✅ Verify all screening steps work
✅ Test AI integration
✅ Test print functionality
✅ Test emergency navigation
✅ Test on different devices/browsers
✅ Monitor for errors
```

---

## 🔍 Troubleshooting Deployment

### Common Issues

#### 1. Build Failures
```bash
# Check build logs in Netlify dashboard
# Common fixes:

# Node version issue
# Solution: Set NODE_VERSION=18 in environment variables

# Dependency issue
# Solution: Delete package-lock.json and reinstall
rm package-lock.json
npm install

# TypeScript errors
# Solution: Check netlify/functions/tsconfig.json
cd netlify/functions
npx tsc --noEmit
```

#### 2. Function Deployment Issues
```bash
# Check function compilation
cd netlify/functions
npx tsc

# Verify output
ls -la .dist/

# Should see: gemini-proxy.js (not gemini-proxy.test.js)
```

#### 3. Environment Variable Issues
```bash
# In Netlify dashboard, verify:
API_KEY=your_actual_key
VITE_GEMINI_API_KEY=your_actual_key
NODE_VERSION=18

# Test API key:
# Go to https://makersuite.google.com/app/apikey
# Verify key is active and has proper permissions
```

#### 4. CORS Issues
```javascript
// Already handled in netlify.toml
// If issues persist, check browser console for specific errors
```

### Debug Commands
```bash
# Check deployment status
netlify status

# View build logs
netlify logs

# Test functions locally
netlify dev

# Deploy preview
netlify deploy
```

---

## 🌟 Advanced Configuration

### Custom Domain Setup
```bash
# In Netlify Dashboard:
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records:
   - Type: CNAME
   - Name: your-subdomain
   - Value: your-netlify-site.netlify.app
4. Enable HTTPS (automatic)
```

### Performance Optimization
```bash
# Already configured in netlify.toml:
- Asset caching
- Compression
- Security headers

# Additional optimizations:
- Image optimization (automatic)
- Function edge deployment
- CDN distribution (automatic)
```

### Monitoring & Analytics
```bash
# Netlify Analytics (optional)
1. Enable in Netlify dashboard
2. Monitor traffic and performance
3. Set up alerts for errors

# Custom monitoring
# Add to your application:
console.log('App loaded:', new Date());
```

---

## 📞 Support & Resources

### Repository Information
- **Your Repository**: https://github.com/satishskid/skidscameraAIscreen.git
- **Original Repository**: https://github.com/thechildclinic/funsense.git

### Documentation
- **User Manual**: docs/USER_MANUAL.md
- **Developer Manual**: docs/DEVELOPER_MANUAL.md
- **This Guide**: docs/DEPLOYMENT_GUIDE.md

### External Resources
- **Netlify Documentation**: https://docs.netlify.com/
- **Google Gemini API**: https://ai.google.dev/docs
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/

### Getting Help
1. **Check documentation** first
2. **Review Netlify build logs** for specific errors
3. **Test locally** before deploying
4. **Check environment variables** are set correctly
5. **Verify API keys** are working

---

## 🎯 Quick Start Summary

### For Immediate Deployment:
```bash
# 1. Push code to your repository
git remote add skids https://github.com/satishskid/skidscameraAIscreen.git
git push skids main

# 2. Deploy to Netlify
# - Connect repository in Netlify dashboard
# - Set environment variables (API_KEY, VITE_GEMINI_API_KEY)
# - Deploy

# 3. Test deployment
# - Verify all features work
# - Test AI integration
# - Test print functionality
```

**Your health screening system will be live and ready for production use!** 🚀

---

*This deployment guide ensures successful setup of your Health Screening System. Follow the steps in order for best results.*
