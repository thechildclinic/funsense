# 🏥 Health Screening System - User Manual

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [System Overview](#system-overview)
3. [Step-by-Step Screening Process](#step-by-step-screening-process)
4. [AI Configuration](#ai-configuration)
5. [Print & Export Features](#print--export-features)
6. [Emergency Navigation](#emergency-navigation)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### System Requirements
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Camera Access** for medical imaging
- **Microphone Access** for audio recordings
- **Internet Connection** for AI analysis
- **Printer** (optional) for report printing

### First Time Setup
1. **Open the Application** in your web browser
2. **Allow Camera/Microphone Access** when prompted
3. **Configure AI Provider** (Settings → AI Configuration)
4. **Test Print Function** (optional)

---

## 🎯 System Overview

### Main Components
- **🏠 Home Screen**: Student ID entry and session management
- **📊 6-Step Screening Workflow**: Complete health assessment
- **⚙️ Settings Panel**: Device and AI configuration
- **🆘 Emergency Navigation**: System recovery options

### Screening Steps
1. **👤 Patient Information** - Basic demographics
2. **📏 Anthropometry** - Height, weight, BMI measurements
3. **💓 Vital Signs** - Heart rate, blood pressure, temperature
4. **📸 Medical Imaging** - Eyes, throat, posture assessment
5. **🔬 Dermatology** - Skin condition evaluation
6. **📋 Review & Export** - Final report generation

---

## 📝 Step-by-Step Screening Process

### Starting a New Screening

#### 1. Student ID Entry
- **QR Code Scan**: Click "Scan QR Code" and scan student ID
- **Manual Entry**: Type student ID in the text field
- **Resume Session**: System automatically detects incomplete screenings

#### 2. Patient Information
- **Required Fields**: Name, Age, Gender, Class, School
- **Auto-Save**: Data saves automatically as you type
- **Validation**: System checks for required information

### Screening Workflow

#### Step 1: Patient Information
```
✅ Enter student name
✅ Select age from dropdown
✅ Choose gender (Male/Female/Other)
✅ Enter class/grade
✅ Enter school name
✅ Click "Next Step"
```

#### Step 2: Anthropometry
```
✅ Measure and enter height (cm/inches)
✅ Measure and enter weight (kg/lbs)
✅ System calculates BMI automatically
✅ Enter head circumference (if applicable)
✅ Review measurements
✅ Click "Next Step"
```

#### Step 3: Vital Signs
```
✅ Measure heart rate (BPM)
✅ Record blood pressure (systolic/diastolic)
✅ Take temperature (°C/°F)
✅ Measure oxygen saturation (%)
✅ System flags abnormal values
✅ Click "Next Step"
```

#### Step 4: Medical Imaging
```
✅ Eye Examination:
   - Click "Capture Eye Image"
   - Position camera properly
   - Take clear photo
   - Add AI analysis if needed

✅ Throat Examination:
   - Click "Capture Throat Image"
   - Use proper lighting
   - Take clear photo
   - Add clinical notes

✅ Posture Assessment:
   - Click "Capture Posture Image"
   - Full body positioning
   - Take front/side views
   - Add observations

✅ Click "Next Step"
```

#### Step 5: Dermatology Assessment
```
✅ Skin Examination Areas:
   - Face and neck
   - Arms and hands
   - Legs and feet
   - Back and torso

✅ For Each Area:
   - Click "Capture Image"
   - Take clear, well-lit photos
   - Use AI analysis for screening
   - Add clinical notes
   - Mark any concerns

✅ Click "Next Step"
```

#### Step 6: Review & Export
```
✅ Review all collected data
✅ Generate AI summary
✅ Add nurse observations
✅ Add preliminary notes for doctor
✅ Save report data
✅ Export or print report
✅ Submit to EMR system
```

---

## 🤖 AI Configuration

### Setting Up AI Provider

#### 1. Access Settings
- Click **⚙️ Settings** button (top-right corner)
- Navigate to **"AI Provider Configuration"** section

#### 2. Choose AI Provider
**Available Options:**
- **🧠 Google Gemini** - Advanced multimodal AI
- **💬 OpenAI GPT** - ChatGPT and GPT models  
- **🎯 Anthropic Claude** - Claude AI assistant
- **📱 Local AI** - On-device processing (privacy-focused)

#### 3. Configure API Key (if required)
```
For Cloud AI Providers:
1. Select your preferred provider
2. Enter API key in the text field
3. Click "Test" to verify connection
4. ✅ Success: Ready to use
5. ❌ Error: Check API key and try again
```

#### 4. Local AI Setup
```
For Local AI:
- No API key required
- Uses on-device models
- Privacy-focused processing
- Works offline
```

### AI Analysis Features
- **📸 Image Analysis** - Automated screening of medical images
- **📝 Report Generation** - AI-powered summary creation
- **🔍 Anomaly Detection** - Flags potential concerns
- **📊 Data Insights** - Pattern recognition and recommendations

---

## 📄 Print & Export Features

### Professional Report Generation

#### 1. Print Function
- **Access**: Review & Export step → "Print View" button
- **Format**: Professional medical report layout
- **Content**: Complete screening data with images
- **Layout**: Optimized for A4 paper printing

#### 2. Report Sections
```
📋 Generated Report Includes:
✅ Patient Information Header
✅ Anthropometric Measurements Table
✅ Vital Signs with Status Indicators
✅ Medical Images with AI Analysis
✅ Dermatology Assessment Results
✅ Clinical Notes and Observations
✅ AI-Generated Summary
✅ Signature Areas for Medical Staff
✅ Professional Medical Formatting
```

#### 3. Export Options
- **📄 Print View** - Browser print dialog
- **💾 JSON Export** - Raw data for EMR integration
- **📧 Digital Sharing** - Email or digital distribution

### Print Best Practices
```
🖨️ Printing Tips:
✅ Use A4 or Letter size paper
✅ Select "More Settings" → "Background Graphics"
✅ Choose appropriate print quality
✅ Preview before printing
✅ Check all images are visible
✅ Verify signature areas are clear
```

---

## 🆘 Emergency Navigation

### When System Hangs or Becomes Unresponsive

#### 1. Emergency Button
- **Location**: Red button in top-right corner (⚠️)
- **Always Visible**: Available on all screens
- **Quick Access**: Click for emergency menu

#### 2. Emergency Options
```
🏠 Go to Home:
- Returns to start screen
- Preserves current data
- Safe navigation option

🔄 Reset Application:
- Clears all data and sessions
- Resets system to initial state
- Use only when system is stuck
```

#### 3. Keyboard Shortcuts
```
⌨️ Emergency Shortcuts:
- Ctrl + Shift + H = Go to Home
- Ctrl + Shift + R = Reset Application
- Works even when UI is unresponsive
```

#### 4. Recovery Process
```
If System Hangs:
1. Try clicking emergency button
2. Use keyboard shortcuts if UI frozen
3. Choose appropriate recovery option
4. Confirm action in dialog
5. System will recover automatically
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Camera/Microphone Issues
```
❌ Problem: Camera not working
✅ Solution:
1. Check browser permissions
2. Refresh device list in Settings
3. Select different camera if available
4. Restart browser if needed
```

#### AI Analysis Issues
```
❌ Problem: AI analysis failing
✅ Solution:
1. Check internet connection
2. Verify API key in Settings
3. Test AI connection
4. Try different AI provider
5. Use Local AI as fallback
```

#### Data Loss Prevention
```
❌ Problem: Worried about losing data
✅ Solution:
- System auto-saves every 30 seconds
- Data persists across browser sessions
- Use "Save Report Data" frequently
- Export important data regularly
```

#### Print Issues
```
❌ Problem: Print layout broken
✅ Solution:
1. Enable "Background Graphics" in print settings
2. Use Chrome or Firefox for best results
3. Check print preview before printing
4. Try "Print View" button for optimized layout
```

### Emergency Contacts
- **Technical Support**: Contact your IT administrator
- **Medical Questions**: Consult supervising physician
- **System Issues**: Use emergency reset function

---

## ✅ Best Practices

### For Medical Staff

#### Data Quality
```
📊 Ensure Accurate Data:
✅ Double-check all measurements
✅ Take clear, well-lit photos
✅ Add detailed clinical notes
✅ Review AI analysis results
✅ Verify patient information
```

#### Workflow Efficiency
```
⚡ Optimize Your Process:
✅ Prepare equipment before starting
✅ Follow consistent measurement procedures
✅ Use AI analysis to guide assessments
✅ Save data frequently during screening
✅ Complete screenings in one session when possible
```

#### Privacy & Security
```
🔒 Protect Patient Data:
✅ Use Local AI for sensitive cases
✅ Clear browser data after shifts
✅ Don't share API keys
✅ Follow institutional privacy policies
✅ Secure physical access to devices
```

### For Administrators

#### System Maintenance
```
🔧 Regular Maintenance:
✅ Update browser regularly
✅ Clear cached data weekly
✅ Monitor AI usage and costs
✅ Backup important configurations
✅ Train staff on emergency procedures
```

#### Performance Optimization
```
🚀 Optimize Performance:
✅ Use dedicated devices for screening
✅ Ensure stable internet connection
✅ Configure appropriate AI providers
✅ Monitor system resource usage
✅ Plan for peak usage periods
```

---

## 📞 Support & Resources

### Getting Help
- **📖 Documentation**: Check this manual first
- **🆘 Emergency Features**: Use built-in recovery options
- **💬 Technical Support**: Contact your system administrator
- **🏥 Medical Support**: Consult supervising healthcare provider

### System Information
- **Version**: Check footer for current version
- **Updates**: Automatic via web deployment
- **Compatibility**: Modern browsers required
- **Performance**: Optimized for healthcare workflows

---

*This manual covers the complete Health Screening System. For technical implementation details, see the Developer Manual.*
