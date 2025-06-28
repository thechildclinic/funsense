# Developer Integration Guide - School Health Screening System

## 🏗️ **SYSTEM ARCHITECTURE**

### **Technology Stack**
```
Frontend: React 18 + Vite
Styling: Tailwind CSS
State Management: React Context + localStorage
AI Integration: Google Gemini API
Camera: MediaDevices API
Deployment: Netlify
PWA: Service Worker enabled
```

### **Project Structure**
```
src/
├── components/           # React components
│   ├── Camera/          # Camera capture components
│   ├── Screens/         # Main screen components
│   └── UI/              # Reusable UI components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── utils/               # Utility functions
└── assets/              # Static assets
```

---

## 🔌 **INTEGRATION OPTIONS**

### **Option 1: Iframe Integration**
```html
<!-- Embed in existing portal -->
<iframe 
  src="https://your-health-screening.netlify.app"
  width="100%" 
  height="800px"
  frameborder="0">
</iframe>
```

### **Option 2: API Integration**
```javascript
// Export data from screening system
const exportData = async (screeningId) => {
  const data = localStorage.getItem(`screening_${screeningId}`);
  return JSON.parse(data);
};

// Send to your backend
const sendToPortal = async (screeningData) => {
  await fetch('https://your-portal.com/api/screenings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(screeningData)
  });
};
```

### **Option 3: Direct Integration**
```bash
# Clone and integrate source code
git clone https://github.com/thechildclinic/funsense.git
cd funsense
npm install

# Customize for your portal
# Modify src/components/Screens/
# Update branding in src/assets/
# Configure API endpoints
```

---

## 🔧 **CONFIGURATION**

### **Environment Variables**
```bash
# Required for AI functionality
VITE_GEMINI_API=your_gemini_api_key_here

# Optional customizations
VITE_APP_NAME="Your School Health System"
VITE_PORTAL_URL="https://your-portal.com"
VITE_SUPPORT_EMAIL="support@yourschool.edu"
```

### **Customization Points**
```javascript
// src/config/app.config.js
export const APP_CONFIG = {
  schoolName: "Your School Name",
  logoUrl: "/assets/your-logo.png",
  primaryColor: "#your-brand-color",
  supportContact: "support@yourschool.edu",
  portalUrl: "https://your-portal.com"
};
```

---

## 📊 **DATA STRUCTURE**

### **Screening Data Format**
```json
{
  "screeningId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "studentInfo": {
    "id": "student123",
    "name": "John Doe",
    "age": 12,
    "gender": "male",
    "preExistingConditions": "none"
  },
  "anthropometry": {
    "height": { "value": 150, "unit": "cm", "confidence": 0.95 },
    "weight": { "value": 45, "unit": "kg", "confidence": 0.98 },
    "bmi": { "value": 20.0, "category": "normal" }
  },
  "vitals": {
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "heartRate": 75,
    "temperature": 98.6,
    "oxygenSaturation": 98
  },
  "imaging": {
    "ent": { "findings": "normal", "images": ["base64..."] },
    "dental": { "findings": "cavity detected", "images": ["base64..."] }
  },
  "dermatology": {
    "generalSkinObservations": "Overall skin appears healthy",
    "lesions": [
      {
        "id": "lesion_001",
        "location": "Left arm",
        "nature": "Mole/Nevus",
        "symptoms": "None",
        "size": "Small (3mm)",
        "color": "Dark brown",
        "shape": "Round",
        "image": "base64...",
        "aiAnalysis": "Appears to be benign nevus...",
        "confidence": 0.85,
        "nurseNotes": "Regular shaped mole, no changes reported"
      }
    ]
  },
  "aiAnalysis": {
    "summary": "Overall health appears normal...",
    "recommendations": ["Regular dental checkup recommended"],
    "riskFactors": []
  }
}
```

---

## 🔗 **API ENDPOINTS FOR INTEGRATION**

### **Data Export Endpoints**
```javascript
// Get screening data
GET /api/screening/{id}

// List all screenings
GET /api/screenings?date=2024-01-15

// Export to your system
POST /api/export
{
  "screeningId": "uuid",
  "format": "json|pdf|csv",
  "destination": "portal|email|download"
}
```

### **Webhook Integration**
```javascript
// Configure webhook in your portal
const webhookConfig = {
  url: "https://your-portal.com/webhooks/screening-complete",
  events: ["screening.completed", "screening.updated"],
  secret: "your-webhook-secret"
};

// Webhook payload
{
  "event": "screening.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": { /* screening data */ }
}
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Data Protection**
```javascript
// Encrypt sensitive data
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Secure API calls
const secureApiCall = async (endpoint, data) => {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-API-Key': process.env.VITE_API_KEY
    },
    body: JSON.stringify(data)
  });
};
```

### **Access Control**
```javascript
// Role-based access
const checkPermissions = (user, action) => {
  const permissions = {
    'nurse': ['view', 'create', 'update'],
    'admin': ['view', 'create', 'update', 'delete', 'export'],
    'viewer': ['view']
  };
  return permissions[user.role]?.includes(action);
};
```

---

## 🚀 **DEPLOYMENT OPTIONS**

### **Option 1: Netlify (Current)**
```bash
# Already deployed at:
https://your-site.netlify.app

# Custom domain setup:
1. Add domain in Netlify dashboard
2. Update DNS records
3. Enable SSL certificate
```

### **Option 2: Your Infrastructure**
```bash
# Build for production
npm run build

# Deploy to your servers
# Copy dist/ folder to web server
# Configure nginx/apache
# Set up SSL certificate
```

### **Option 3: Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔄 **MAINTENANCE & UPDATES**

### **Regular Tasks**
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Performance monitoring
npm run analyze

# Backup data
node scripts/backup-data.js
```

### **Monitoring Setup**
```javascript
// Error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});

// Analytics
import { Analytics } from '@vercel/analytics/react';

// Performance monitoring
import { SpeedInsights } from '@vercel/speed-insights/react';
```

---

## 📞 **SUPPORT & ESCALATION**

### **Development Support**
- **Repository**: https://github.com/thechildclinic/funsense.git
- **Issues**: Create GitHub issues for bugs
- **Documentation**: Check README.md for updates
- **Community**: Join developer discussions

### **Emergency Contacts**
- **Critical Issues**: [Emergency Contact]
- **Security Issues**: [Security Team]
- **Performance Issues**: [DevOps Team]

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Maintainer**: [Your Development Team]
