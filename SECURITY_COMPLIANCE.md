# Security & Compliance Guide

## 🔒 **SECURITY OVERVIEW**

The School Health Screening System is designed with security and privacy as core principles. This guide outlines security measures, compliance considerations, and best practices for deployment in educational and healthcare environments.

## 🛡️ **SECURITY ARCHITECTURE**

### **Data Flow Security**
```
Student Device → Local Storage → Export Only
     ↓
No External Transmission
No Cloud Storage
No Third-party Analytics
```

### **Key Security Features**
- **🔐 Local Data Storage**: All data stored locally on device
- **🚫 No External Transmission**: No data sent to external servers
- **🔒 HTTPS Enforcement**: Secure connection required
- **👤 User Consent**: Clear permissions for camera/device access
- **🔑 API Key Protection**: Secure server-side API management
- **🛡️ CSP Headers**: Content Security Policy implementation

---

## 📋 **COMPLIANCE FRAMEWORKS**

### **HIPAA Considerations**

#### **Covered Entities**
```
✅ Designed for educational health screening
✅ Local data storage (no PHI transmission)
✅ User access controls
✅ Audit trail capabilities
⚠️  Requires institutional HIPAA assessment
```

#### **Technical Safeguards**
```
✅ Access Control: Device-level authentication
✅ Audit Controls: Local logging capabilities
✅ Integrity: Data validation and checksums
✅ Transmission Security: HTTPS enforcement
```

#### **Administrative Safeguards**
```
📋 Required: Staff training on privacy procedures
📋 Required: Incident response procedures
📋 Required: Regular security assessments
📋 Required: Business associate agreements (if applicable)
```

### **FERPA Compliance**

#### **Educational Records Protection**
```
✅ Student health screening data classification
✅ Parental consent mechanisms
✅ Limited access to authorized personnel
✅ Data retention policy compliance
⚠️  Requires school district policy alignment
```

#### **Directory Information**
```
📋 Student ID handling procedures
📋 Consent for health screening participation
📋 Data sharing limitations
📋 Parent notification requirements
```

### **COPPA Compliance (Under 13)**

#### **Parental Consent**
```
📋 Required: Verifiable parental consent
📋 Required: Clear privacy notice
📋 Required: Data collection limitations
📋 Required: Deletion procedures
```

---

## 🔐 **TECHNICAL SECURITY MEASURES**

### **Data Protection**

#### **Encryption at Rest**
```javascript
// Local storage encryption example
const encryptData = (data, key) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data), 
    key
  ).toString();
  return encrypted;
};

const decryptData = (encryptedData, key) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};

// Usage in localStorage service
const saveSecureData = (key, data) => {
  const encryptionKey = generateDeviceKey();
  const encrypted = encryptData(data, encryptionKey);
  localStorage.setItem(key, encrypted);
};
```

#### **Data Validation**
```javascript
// Input sanitization
const sanitizeInput = (input) => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};

// Medical data validation
const validateVitalSigns = (vitals) => {
  const rules = {
    bloodPressure: {
      systolic: { min: 70, max: 250 },
      diastolic: { min: 40, max: 150 }
    },
    heartRate: { min: 30, max: 220 },
    temperature: { min: 95, max: 110 },
    oxygenSaturation: { min: 70, max: 100 }
  };
  
  // Validate against medical ranges
  return Object.keys(vitals).every(key => {
    const value = vitals[key];
    const rule = rules[key];
    return rule ? value >= rule.min && value <= rule.max : true;
  });
};
```

### **Access Control**

#### **Role-Based Permissions**
```javascript
const userRoles = {
  NURSE: {
    permissions: ['view', 'create', 'update', 'export'],
    modules: ['all']
  },
  ADMIN: {
    permissions: ['view', 'create', 'update', 'delete', 'export', 'manage'],
    modules: ['all']
  },
  VIEWER: {
    permissions: ['view'],
    modules: ['review']
  }
};

const checkPermission = (user, action, module) => {
  const role = userRoles[user.role];
  return role && 
         role.permissions.includes(action) && 
         (role.modules.includes('all') || role.modules.includes(module));
};
```

#### **Session Management**
```javascript
const sessionManager = {
  timeout: 30 * 60 * 1000, // 30 minutes
  
  startSession: (userId) => {
    const session = {
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      id: generateSessionId()
    };
    
    sessionStorage.setItem('healthScreeningSession', JSON.stringify(session));
    return session;
  },
  
  validateSession: () => {
    const session = JSON.parse(sessionStorage.getItem('healthScreeningSession'));
    if (!session) return false;
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    if (timeSinceActivity > sessionManager.timeout) {
      sessionManager.endSession();
      return false;
    }
    
    // Update last activity
    session.lastActivity = now;
    sessionStorage.setItem('healthScreeningSession', JSON.stringify(session));
    return true;
  },
  
  endSession: () => {
    sessionStorage.removeItem('healthScreeningSession');
    // Clear sensitive data
    localStorage.removeItem('currentScreening');
  }
};
```

### **API Security**

#### **Secure API Proxy**
```javascript
// netlify/functions/gemini-proxy.ts
export const handler = async (event, context) => {
  // Validate request origin
  const allowedOrigins = [
    'https://your-domain.netlify.app',
    'https://your-custom-domain.com'
  ];
  
  const origin = event.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden origin' })
    };
  }
  
  // Rate limiting
  const clientIP = event.headers['client-ip'];
  if (await isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Rate limit exceeded' })
    };
  }
  
  // Input validation
  const body = JSON.parse(event.body);
  if (!validateAPIInput(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid input' })
    };
  }
  
  // Secure API call
  try {
    const response = await callGeminiAPI(body);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

---

## 🔍 **PRIVACY PROTECTION**

### **Data Minimization**
```javascript
const dataMinimization = {
  // Only collect necessary data
  requiredFields: [
    'studentId',
    'age',
    'gender'
  ],
  
  optionalFields: [
    'name', // Can be anonymized
    'preExistingConditions'
  ],
  
  // Automatic data cleanup
  cleanupOldData: () => {
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('screening_')) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.timestamp < cutoffDate) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};
```

### **Anonymization Options**
```javascript
const anonymizeData = (screeningData) => {
  return {
    ...screeningData,
    studentInfo: {
      ...screeningData.studentInfo,
      name: null, // Remove name
      id: hashStudentId(screeningData.studentInfo.id) // Hash ID
    },
    metadata: {
      anonymized: true,
      timestamp: Date.now()
    }
  };
};

const hashStudentId = (id) => {
  return CryptoJS.SHA256(id + process.env.HASH_SALT).toString();
};
```

---

## 📊 **AUDIT & MONITORING**

### **Audit Trail**
```javascript
const auditLogger = {
  log: (action, userId, details) => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
      sessionId: getCurrentSessionId(),
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent
    };
    
    // Store locally for review
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
      auditLog.splice(0, auditLog.length - 1000);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
  },
  
  exportAuditLog: () => {
    const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
    const blob = new Blob([JSON.stringify(auditLog, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Usage examples
auditLogger.log('SCREENING_STARTED', userId, { studentId: 'STU123' });
auditLogger.log('DATA_EXPORTED', userId, { format: 'JSON', recordCount: 1 });
auditLogger.log('DEVICE_CONNECTED', userId, { deviceType: 'bluetooth', deviceName: 'BP Monitor' });
```

### **Security Monitoring**
```javascript
const securityMonitor = {
  detectAnomalies: () => {
    const recentActivity = getRecentAuditEntries(24); // Last 24 hours
    
    // Check for suspicious patterns
    const alerts = [];
    
    // Multiple failed login attempts
    const failedLogins = recentActivity.filter(entry => 
      entry.action === 'LOGIN_FAILED'
    );
    if (failedLogins.length > 5) {
      alerts.push({
        type: 'MULTIPLE_FAILED_LOGINS',
        severity: 'HIGH',
        count: failedLogins.length
      });
    }
    
    // Unusual data export activity
    const exports = recentActivity.filter(entry => 
      entry.action === 'DATA_EXPORTED'
    );
    if (exports.length > 10) {
      alerts.push({
        type: 'EXCESSIVE_EXPORTS',
        severity: 'MEDIUM',
        count: exports.length
      });
    }
    
    return alerts;
  },
  
  generateSecurityReport: () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalUsers: getUserCount(),
      activeScreenings: getActiveScreeningCount(),
      dataExports: getExportCount(7), // Last 7 days
      securityAlerts: securityMonitor.detectAnomalies(),
      systemHealth: {
        storageUsage: getStorageUsage(),
        performanceMetrics: getPerformanceMetrics()
      }
    };
    
    return report;
  }
};
```

---

## 📋 **COMPLIANCE CHECKLIST**

### **Pre-Deployment Security Review**
```
□ Security architecture review completed
□ Penetration testing performed
□ Code security audit completed
□ Data flow analysis documented
□ Privacy impact assessment conducted
□ Incident response plan created
□ Staff training materials prepared
□ Compliance documentation reviewed
```

### **Ongoing Compliance Tasks**
```
□ Regular security assessments (quarterly)
□ Audit log reviews (monthly)
□ Staff training updates (annually)
□ Policy reviews (annually)
□ Vulnerability assessments (bi-annually)
□ Data retention compliance (ongoing)
□ Incident response testing (annually)
```

---

## 🚨 **INCIDENT RESPONSE**

### **Security Incident Types**
1. **Data Breach**: Unauthorized access to student data
2. **System Compromise**: Malware or unauthorized system access
3. **Privacy Violation**: Improper data handling or disclosure
4. **Device Theft**: Loss of device containing screening data

### **Response Procedures**
```
1. IMMEDIATE (0-1 hour):
   □ Isolate affected systems
   □ Assess scope of incident
   □ Notify security team
   □ Document initial findings

2. SHORT-TERM (1-24 hours):
   □ Contain the incident
   □ Preserve evidence
   □ Notify stakeholders
   □ Begin remediation

3. LONG-TERM (1-30 days):
   □ Complete investigation
   □ Implement fixes
   □ Update policies
   □ Conduct lessons learned
```

---

## 📞 **SECURITY CONTACTS**

- **Security Team**: [security@yourschool.edu]
- **Privacy Officer**: [privacy@yourschool.edu]
- **IT Director**: [itdirector@yourschool.edu]
- **Legal Counsel**: [legal@yourschool.edu]

---

**Last Updated**: [Current Date]
**Classification**: Internal Use Only
**Review Cycle**: Annual
