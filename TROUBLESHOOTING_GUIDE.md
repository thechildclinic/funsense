# Troubleshooting Guide - School Health Screening System

## 🚨 **CRITICAL ISSUES**

### **🔴 System Completely Down**
```
Symptoms: Site won't load, 404 errors, blank page
Priority: CRITICAL - Fix immediately

Immediate Actions:
1. Check Netlify deployment status
2. Verify domain/DNS settings
3. Check for recent deployments
4. Roll back if necessary

Solutions:
□ Redeploy from GitHub
□ Check build logs in Netlify
□ Verify environment variables
□ Contact hosting support
```

### **🔴 Camera Not Working**
```
Symptoms: Black screen, permission denied, no camera access
Priority: HIGH - Core functionality affected

Immediate Actions:
1. Check browser permissions
2. Test on different device
3. Verify HTTPS connection
4. Check camera hardware

Solutions:
□ Grant camera permissions in browser
□ Use supported browser (Chrome/Firefox/Safari)
□ Ensure HTTPS (not HTTP)
□ Try external USB camera
□ Clear browser cache and cookies
```

### **🔴 AI Analysis Failing**
```
Symptoms: "Analysis failed", no AI responses, timeout errors
Priority: HIGH - Key feature unavailable

Immediate Actions:
1. Check Gemini API key status
2. Verify internet connection
3. Check API quota/billing
4. Test with simple request

Solutions:
□ Verify VITE_GEMINI_API environment variable
□ Check Google Cloud Console for API status
□ Ensure API billing is enabled
□ Check rate limits and quotas
□ Try different image/smaller file size
```

---

## ⚠️ **COMMON ISSUES**

### **📱 Mobile Device Problems**
```
Issue: App not working on mobile
Symptoms: Layout broken, camera issues, slow performance

Troubleshooting Steps:
1. Check device compatibility
   □ iOS 12+ or Android 8+
   □ Modern browser version
   □ Sufficient storage space

2. Browser-specific fixes:
   □ Safari: Enable camera in Settings
   □ Chrome: Clear site data
   □ Firefox: Check permissions

3. Performance optimization:
   □ Close other apps
   □ Restart browser
   □ Clear cache
   □ Use WiFi instead of cellular
```

### **💾 Data Not Saving**
```
Issue: Progress lost between screens
Symptoms: Data disappears, have to re-enter information

Troubleshooting Steps:
1. Check browser storage:
   □ Not in incognito/private mode
   □ Storage not full
   □ Cookies enabled

2. Browser settings:
   □ Allow local storage
   □ Don't clear data on exit
   □ Disable aggressive privacy settings

3. Solutions:
   □ Use regular browser window
   □ Clear browser cache completely
   □ Try different browser
   □ Check available storage space
```

### **🖼️ Image Quality Issues**
```
Issue: Blurry images, poor AI analysis
Symptoms: Low confidence scores, incorrect readings

Troubleshooting Steps:
1. Lighting conditions:
   □ Ensure adequate lighting
   □ Avoid backlighting
   □ Use natural light when possible

2. Camera positioning:
   □ Hold device steady
   □ Maintain proper distance
   □ Clean camera lens

3. Image capture:
   □ Wait for focus
   □ Capture multiple angles
   □ Retake if blurry
   □ Use timer for stability
```

---

## 🔧 **TECHNICAL DIAGNOSTICS**

### **Browser Compatibility Check**
```javascript
// Run in browser console to check compatibility
console.log('Browser:', navigator.userAgent);
console.log('Camera support:', !!navigator.mediaDevices);
console.log('Local storage:', !!window.localStorage);
console.log('Service worker:', 'serviceWorker' in navigator);

// Check camera permissions
navigator.mediaDevices.getUserMedia({video: true})
  .then(() => console.log('Camera: ✅ Available'))
  .catch(err => console.log('Camera: ❌', err.message));
```

### **Network Diagnostics**
```bash
# Check connectivity
ping google.com

# Test API endpoint
curl -X POST https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent

# Check DNS resolution
nslookup your-site.netlify.app

# Test HTTPS certificate
openssl s_client -connect your-site.netlify.app:443
```

### **Performance Diagnostics**
```javascript
// Check performance in browser console
console.log('Memory usage:', performance.memory);
console.log('Navigation timing:', performance.getEntriesByType('navigation'));

// Check local storage usage
let total = 0;
for(let key in localStorage) {
  if(localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length;
  }
}
console.log('LocalStorage usage:', total, 'characters');
```

---

## 🛠️ **STEP-BY-STEP FIXES**

### **Fix 1: Complete Browser Reset**
```
When: Multiple issues, general instability
Steps:
1. Close all browser tabs
2. Clear all browsing data:
   - Cookies and site data
   - Cached images and files
   - Local storage
3. Restart browser completely
4. Navigate to site fresh
5. Allow all permissions when prompted
```

### **Fix 2: Camera Permission Reset**
```
When: Camera not working after working before
Steps:
1. Click lock icon in address bar
2. Reset permissions for camera
3. Refresh the page
4. Allow camera when prompted
5. Test camera functionality

Alternative:
1. Go to browser settings
2. Find site permissions
3. Reset all permissions
4. Revisit site and re-grant
```

### **Fix 3: API Key Verification**
```
When: AI analysis not working
Steps:
1. Check Netlify environment variables
2. Verify VITE_GEMINI_API is set correctly
3. Test API key in Google AI Studio
4. Check billing status in Google Cloud
5. Redeploy if key was updated
```

### **Fix 4: Mobile Safari Specific**
```
When: Issues on iPhone/iPad
Steps:
1. Settings > Safari > Privacy & Security
2. Disable "Prevent Cross-Site Tracking"
3. Enable "Camera & Microphone Access"
4. Clear Safari cache
5. Restart Safari
6. Test functionality
```

---

## 📊 **ERROR CODES & MEANINGS**

### **Camera Errors**
```
NotAllowedError: User denied camera permission
NotFoundError: No camera device found
NotReadableError: Camera in use by another app
OverconstrainedError: Camera doesn't support requirements
SecurityError: HTTPS required for camera access
```

### **AI API Errors**
```
400: Bad request - Check image format/size
401: Unauthorized - Invalid API key
403: Forbidden - API not enabled or billing issue
429: Rate limited - Too many requests
500: Server error - Try again later
```

### **Storage Errors**
```
QuotaExceededError: Browser storage full
SecurityError: Storage blocked by browser settings
InvalidStateError: Storage not available
```

---

## 📞 **ESCALATION PROCEDURES**

### **Level 1: User Self-Service**
- Check this troubleshooting guide
- Try basic fixes (refresh, permissions)
- Test on different device/browser

### **Level 2: IT Support**
- Advanced browser diagnostics
- Network connectivity issues
- Device-specific problems
- User training needs

### **Level 3: Developer Support**
- Code-level issues
- API integration problems
- Performance optimization
- Feature requests

### **Level 4: Emergency Response**
- System-wide outages
- Security incidents
- Data loss scenarios
- Critical deployment issues

---

## 📋 **DIAGNOSTIC CHECKLIST**

### **Before Contacting Support**
```
□ What browser and version?
□ What device and OS?
□ What specific error message?
□ When did the issue start?
□ Can you reproduce it consistently?
□ Have you tried basic fixes?
□ Are other users affected?
□ Any recent changes to system?
```

### **Information to Collect**
```
□ Screenshot of error
□ Browser console logs
□ Network tab in dev tools
□ Steps to reproduce
□ User account details
□ Time and date of issue
□ Any error codes displayed
```

---

**Emergency Contact**: [Your Support Contact]
**Last Updated**: [Current Date]
**Version**: 1.0
