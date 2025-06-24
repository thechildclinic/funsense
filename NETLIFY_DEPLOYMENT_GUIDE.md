# Quick Netlify Deployment Guide

## 🚀 Your Project is Ready for Deployment!

### Step 1: Push to GitHub/GitLab/Bitbucket

Since you're already logged into Netlify, you'll need to push this code to a Git repository first.

**If you don't have a repository yet:**
1. Go to GitHub.com and create a new repository
2. Copy the repository URL (e.g., `https://github.com/yourusername/school-health-screening.git`)

**Then run these commands:**
```bash
# Add your remote repository
git remote add origin YOUR_REPOSITORY_URL_HERE

# Push to your repository
git push -u origin main
```

### Step 2: Deploy on Netlify

1. **In your Netlify dashboard:**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select the repository you just pushed to

2. **Build Settings (should auto-detect from netlify.toml):**
   - **Build command**: `npm run netlify:build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions/.dist`

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add: `VITE_GEMINI_API` = `your_actual_gemini_api_key`
   - (Optional) Also add `API_KEY` = `your_actual_gemini_api_key` for compatibility

4. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (usually 2-3 minutes)

### Step 3: Verify Deployment

Once deployed, test these features:
- [ ] Site loads without errors
- [ ] Can start a new screening
- [ ] Camera capture works
- [ ] AI analysis functions (requires valid API key)
- [ ] Data saves to localStorage
- [ ] Settings modal opens

### Environment Variable Setup

**Required in Netlify:**
```
VITE_GEMINI_API=your_actual_gemini_api_key_here
```

**Optional (for compatibility):**
```
API_KEY=your_actual_gemini_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Build Configuration

The project is configured with:
- **Node.js version**: 18+
- **Package manager**: npm
- **Build time**: ~2-3 minutes
- **Bundle size**: ~2-3 MB optimized

### Troubleshooting

**If build fails:**
1. Check build logs in Netlify dashboard
2. Verify Node.js version is 18+
3. Ensure all environment variables are set

**If functions don't work:**
1. Verify `VITE_GEMINI_API` is set correctly
2. Check function logs in Netlify dashboard
3. Test API key in Google AI Studio

**If camera doesn't work:**
1. Ensure site is served over HTTPS (Netlify does this automatically)
2. Check browser permissions
3. Try on different devices/browsers

### Performance Features Included

✅ **PWA Ready** - Can be installed as native app  
✅ **Offline Support** - Basic functionality works offline  
✅ **Code Splitting** - Optimized loading  
✅ **Caching** - Fast subsequent loads  
✅ **Mobile Optimized** - Responsive design  
✅ **Security Headers** - Production-ready security  

### Next Steps After Deployment

1. **Custom Domain** (optional):
   - Go to Domain settings in Netlify
   - Add your custom domain
   - Configure DNS records

2. **Analytics** (optional):
   - Enable Netlify Analytics
   - Set up error tracking

3. **Form Handling** (if needed):
   - Netlify Forms for contact/feedback

### Support

- **Documentation**: Check README.md and other guides
- **Issues**: Create GitHub issues in your repository
- **Netlify Support**: Available in Netlify dashboard

---

**Your deployment URL will be**: `https://your-site-name.netlify.app`

🎉 **Ready to deploy!** Just push to Git and connect to Netlify!
