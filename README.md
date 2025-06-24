# 🏥 School Health Screening System

**A comprehensive AI-powered health screening application for schools, featuring camera-based measurements, vital signs monitoring, automated health assessments, and medical device integration.**

## 🌟 **LIVE DEPLOYMENT**
**Production URL**: https://your-site-name.netlify.app *(Replace with your actual Netlify URL)*

## 📋 **OVERVIEW**

The School Health Screening System is a comprehensive web-based application designed to assist nurses and healthcare professionals in conducting systematic health screenings for students. It leverages AI-powered analysis for various checks, including anthropometry (BMI, height, weight, arm span), Optical Character Recognition (OCR) for device readings, and observational analysis for ENT (Ear, Nose, Throat) and dental health via connected cameras.

### **Key Capabilities**
- **🤖 AI-Powered Analysis**: Google Gemini integration for intelligent health assessments
- **📱 Multi-Device Support**: Works on tablets, smartphones, and desktop computers
- **🔗 Device Integration**: Bluetooth and USB medical device connectivity
- **🔒 Privacy-First Design**: All data stored locally, no external transmission
- **👥 Multi-User Workflow**: Support for multiple nurses on shared devices
- **📊 Comprehensive Reporting**: Detailed health screening reports with export options

### **⚠️ Important Medical Disclaimer**
This system is built for **screening and educational purposes** to showcase potential AI integration in health screening processes. It is **NOT a diagnostic tool** and all AI-generated suggestions or reports require validation by qualified medical professionals. The system is designed with a conceptual backend in mind; data marked as "complete" by nurses is intended for submission to a central server for aggregated doctor review.

## 🚀 **CORE FEATURES**

### **📋 Screening Workflow**
- **👤 Student Identification**: QR code simulation and manual entry for student details, including pre-existing conditions
- **📏 Anthropometry Module**: AI-powered height and weight measurements using camera with tap-to-measure functionality
- **🔍 Specialized Imaging**: ENT and dental examinations with AI analysis and video capture
- **💓 Vital Signs Monitoring**: Blood pressure, SpO2, temperature, and hemoglobin with device integration
- **📊 Review & Export**: Comprehensive review screen with JSON export and print capabilities

### **🤖 AI-Powered Analysis**
- **🔤 OCR Technology**: Reading values from device displays automatically
- **📈 BMI Interpretation**: Intelligent analysis and categorization
- **🩺 Medical Image Analysis**: Descriptive analysis of ENT and dental images/video frames
- **👤 Silhouette Observation**: Height measurement validation from captured images
- **📝 Comprehensive Reporting**: AI-generated summary reports with medical insights

### **🔗 Device Integration**
- **📱 Camera Integration**: Built-in and external USB cameras for high-quality captures
- **🔵 Bluetooth Devices**: Blood pressure monitors, pulse oximeters, digital thermometers
- **🔌 USB Medical Devices**: Digital scales, height measurers, digital stethoscopes
- **⚡ Real-time Data Capture**: Automatic device reading with validation

### **👥 Multi-User Collaboration**
- **🔄 Shared Device Workflow**: Multiple nurses can work on different modules for the same student
- **💾 Progress Saving**: Explicit save points with localStorage persistence
- **📋 Module Assignment**: Flexible module completion by different healthcare professionals
- **🔄 Session Management**: Secure session handling with timeout protection

### **🔒 Privacy & Security**
- **🏠 Local Data Storage**: All data stored locally on device, no external transmission
- **🔐 Secure API Proxy**: Google Gemini API accessed through secure Netlify Functions
- **👤 User Consent**: Clear permissions for camera and device access
- **🛡️ HIPAA Considerations**: Designed with medical privacy compliance in mind

### **📱 Technical Features**
- **📱 Responsive Design**: Optimized for tablets, smartphones, and desktop computers
- **🔄 PWA Support**: Progressive Web App with offline capabilities
- **⚙️ Application Settings**: Camera/microphone selection and data management
- **🌐 Cross-Platform**: Windows, macOS, iOS, Android support

## 🛠️ **TECHNOLOGY STACK**

### **Frontend Technologies**
- **⚛️ React**: v19+ with TypeScript for type safety
- **🎨 Styling**: Tailwind CSS (via CDN) with Font Awesome icons
- **📱 PWA**: Service Worker enabled for offline functionality
- **🔄 State Management**: React Context API (ScreeningContext, SettingsContext)
- **💾 Storage**: localStorage for session persistence and settings
- **📦 Module System**: ES Modules directly in browser using import maps (esm.sh)

### **Backend & Integration**
- **🤖 AI Integration**: Google Gemini API (`@google/genai` SDK) via Netlify Functions
- **🔒 Backend Proxy**: Netlify Functions (Node.js/TypeScript) for secure API access
- **🔗 Device APIs**: Web Bluetooth API and Web USB API for medical device integration
- **📡 Deployment**: Netlify with automatic deployments from GitHub

### **Browser APIs Used**
- **📷 MediaDevices API**: Camera and microphone access
- **🔵 Web Bluetooth API**: Bluetooth medical device connectivity
- **🔌 Web USB API**: USB medical device integration
- **💾 Web Storage API**: Local data persistence
- **🔔 Notifications API**: User alerts and confirmations

## 📚 **COMPLETE DOCUMENTATION PACKAGE**

### **📖 User & Training Documentation**
- **[📋 Team Training Manual](TEAM_TRAINING_MANUAL.md)** - Complete user guide for staff training and daily operations
- **[🚨 Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)** - Common issues, solutions, and diagnostic procedures
- **[✅ Deployment Checklist](DEPLOYMENT_COMPLETION_CHECKLIST.md)** - Production deployment and go-live guide

### **🔧 Technical Documentation**
- **[🔧 Developer Integration Guide](DEVELOPER_INTEGRATION_GUIDE.md)** - Technical integration with existing systems
- **[🔗 Device Integration Guide](DEVICE_INTEGRATION_GUIDE.md)** - Bluetooth/USB medical device setup and configuration
- **[🔒 Security & Compliance](SECURITY_COMPLIANCE.md)** - Privacy, security, and medical compliance guidelines

### **🎯 Quick Reference**
- [🚀 Quick Start](#-quick-start) - Get up and running in 5 minutes
- [📱 Usage Workflow](#-usage-workflow) - Step-by-step screening process
- [🔗 Device Setup](#-supported-devices) - Medical device integration
- [🆘 Support](#-support--help) - Getting help and reporting issues

---

## 🚀 **QUICK START**

### **Prerequisites**
```
✅ Modern web browser (Chrome/Edge recommended for device integration)
✅ Internet connectivity for AI analysis
✅ Google Gemini API Key (get from Google AI Studio)
✅ Camera-enabled device (tablet/laptop/smartphone)
✅ Optional: Bluetooth/USB medical devices
```

### **🎯 For End Users (Nurses/Staff)**
1. **Access the live application**: https://your-site-name.netlify.app
2. **Allow camera permissions** when prompted
3. **Start your first screening** by entering a student ID
4. **Follow the guided workflow** through each module
5. **Export or print** the completed screening report

### **🔧 For Developers/IT Staff**

#### **Local Development Setup**
```bash
# 1. Clone the repository
git clone https://github.com/thechildclinic/funsense.git
cd funsense

# 2. Install dependencies
npm install

# 3. Set up environment variables
echo "API_KEY=your_gemini_api_key_here" > .env

# 4. Start local development server
netlify dev
# Opens at http://localhost:8888
```

#### **Production Deployment**
```bash
# 1. Push to GitHub repository
git add .
git commit -m "Initial deployment"
git push origin main

# 2. Connect to Netlify
# - Link GitHub repository in Netlify dashboard
# - Set environment variable: API_KEY=your_gemini_api_key
# - Deploy automatically

# 3. Configure custom domain (optional)
# - Add domain in Netlify dashboard
# - Update DNS records
# - SSL automatically enabled
```

## 📱 **USAGE WORKFLOW**

### **Step-by-Step Screening Process**

#### **1. Student Identification**
```
📝 Enter student ID (manual or QR code simulation)
📋 Fill basic information: name, age, gender, conditions
🚀 Click "Start Screening" to begin
```

#### **2. Anthropometry Module**
```
📏 Height Measurement:
   • Position student against measuring station
   • Capture image with ruler visible
   • Tap measurement points on image
   • AI calculates height automatically

⚖️ Weight Measurement:
   • Have student step on scale
   • Capture clear image of display
   • AI reads weight value via OCR
   • Verify and correct if needed

📊 BMI Calculation:
   • Automatically calculated from height/weight
   • AI provides health category interpretation
```

#### **3. Specialized Imaging**
```
👂 ENT Examination:
   • Select examination type (ear/nose/throat)
   • Position camera appropriately
   • Capture images or video
   • AI analyzes for abnormalities

🦷 Dental Examination:
   • Position for oral cavity view
   • Capture clear images
   • AI analyzes dental health
   • Add nurse observations
```

#### **4. Vital Signs**
```
🩺 Device Integration:
   • Connect Bluetooth/USB medical devices
   • Automatic data capture from devices
   • Real-time validation and display

📷 Camera Capture:
   • Capture device display images
   • AI reads values via OCR
   • Manual entry fallback available

💓 Measurements Include:
   • Blood pressure (systolic/diastolic)
   • Heart rate and rhythm
   • Temperature (oral/temporal)
   • Oxygen saturation (SpO2)
```

#### **5. Review & Export**
```
📋 Review all collected data
✏️ Add final nurse observations
🤖 Generate AI summary report
📄 Export options: JSON, Print view
✅ Mark screening complete
```

---

## 🔗 **SUPPORTED DEVICES**

### **📱 Camera Requirements**
| Device Type | Minimum Resolution | Recommended |
|-------------|-------------------|-------------|
| Built-in Camera | 720p | 1080p+ |
| External USB | 1080p | 4K for detailed imaging |
| Smartphone | 8MP | 12MP+ |

### **🔵 Bluetooth Medical Devices**
| Device Category | Supported Brands | Models |
|----------------|------------------|---------|
| **Blood Pressure** | Omron, A&D Medical, Beurer | BLESmart series, UA series, BM series |
| **Pulse Oximeters** | Nonin, Masimo, Contec | 3230, MightySat, CMS50 series |
| **Thermometers** | Braun, iHealth, Omron | ThermoScan, PT3SBT, MC series |
| **Digital Scales** | Tanita, Omron, Withings | BC series, HBF series, Body+ |

### **🔌 USB Medical Devices**
| Device Category | Supported Brands | Connection Type |
|----------------|------------------|-----------------|
| **Digital Scales** | Tanita, Seca, Detecto | USB-A, USB-C |
| **Stadiometers** | Seca, Health-o-meter | USB with serial protocol |
| **Digital Stethoscopes** | 3M Littmann, Eko | USB audio interface |

### **🌐 Browser Compatibility**
| Browser | Camera | Bluetooth | USB | Recommended |
|---------|--------|-----------|-----|-------------|
| Chrome 90+ | ✅ | ✅ | ✅ | ⭐ Best |
| Edge 90+ | ✅ | ✅ | ✅ | ⭐ Best |
| Firefox 88+ | ✅ | ❌ | ❌ | ⚠️ Limited |
| Safari 14+ | ✅ | ❌ | ❌ | ⚠️ Limited |

**💡 Tip**: Use Chrome or Edge for full device integration capabilities.

---

## 🔐 **API KEY MANAGEMENT**

### **🔒 Security Architecture**
The Google Gemini API Key is managed securely using Netlify Functions as a proxy:

```
Frontend → Netlify Function → Google Gemini API
   ↓              ↓                    ↓
No API Key    Secure Access      AI Analysis
```

### **⚙️ Environment Setup**
```bash
# Local development (.env file)
API_KEY=your_gemini_api_key_here

# Production (Netlify Dashboard)
# Site Settings → Environment Variables
# Key: API_KEY
# Value: your_gemini_api_key_here
```

### **🛡️ Security Features**
- ✅ API key never exposed to frontend
- ✅ Secure serverless function proxy
- ✅ Request validation and rate limiting
- ✅ Origin verification for API calls

## 🧪 **TESTING & QUALITY ASSURANCE**

### **🔬 Testing Framework**
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Component tests
npm run test:integration # API integration tests
npm run test:e2e         # End-to-end testing
npm run test:devices     # Device integration tests
```

### **✅ Quality Measures**
- **🧪 Unit Tests**: Component and service testing with Vitest
- **🔗 Integration Tests**: Frontend-backend communication testing
- **🔒 Type Safety**: Full TypeScript coverage with strict mode
- **⚡ Performance**: Code splitting, caching, and PWA optimization
- **🛡️ Security**: Secure API proxy, CSP headers, and data protection
- **📱 Cross-Platform**: Testing on multiple devices and browsers

## 🤝 **CONTRIBUTING**

### **🔧 Development Setup**
```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/funsense.git
cd funsense

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your API keys and configuration

# 4. Start development server
netlify dev
# Opens at http://localhost:8888

# 5. Make your changes and test
npm test
npm run lint
npm run type-check
```

### **📋 Development Guidelines**
- **🔍 Code Quality**: Follow React best practices and TypeScript strict mode
- **🧪 Testing**: Write tests for new features and bug fixes
- **📖 Documentation**: Update documentation for any new features
- **🔒 Security**: Follow security guidelines for medical applications
- **📱 Compatibility**: Test on multiple devices and browsers

### **🚀 Pull Request Process**
1. **🌿 Create a feature branch**: `git checkout -b feature/amazing-feature`
2. **💻 Make your changes**: Follow coding standards and add tests
3. **✅ Test thoroughly**: Run all tests and manual testing
4. **📝 Update documentation**: Include relevant documentation updates
5. **🔄 Submit PR**: Open a pull request with clear description

### **🐛 Bug Reports**
When reporting bugs, please include:
- **📱 Device and browser information**
- **🔄 Steps to reproduce the issue**
- **📸 Screenshots or error messages**
- **📋 Expected vs actual behavior**

### **💡 Feature Requests**
For new features, please:
- **📋 Describe the use case and benefits**
- **🎯 Explain the proposed solution**
- **🔍 Consider security and privacy implications**
- **📱 Think about cross-platform compatibility**

## 📁 **PROJECT STRUCTURE**

```
📦 School Health Screening System
├── 📄 README.md                     # This comprehensive guide
├── 📋 TEAM_TRAINING_MANUAL.md       # Complete user training guide
├── 🔧 DEVELOPER_INTEGRATION_GUIDE.md # Technical integration documentation
├── 🚨 TROUBLESHOOTING_GUIDE.md      # Common issues and solutions
├── ✅ DEPLOYMENT_COMPLETION_CHECKLIST.md # Production deployment guide
├── 🔗 DEVICE_INTEGRATION_GUIDE.md   # Bluetooth/USB device setup
├── 🔒 SECURITY_COMPLIANCE.md        # Privacy and compliance guidelines
│
├── ⚙️ netlify.toml                  # Netlify configuration
├── 📦 package.json                  # Dependencies and build scripts
├── 🔐 .env                          # Environment variables (local)
├── 🚫 .gitignore                    # Git ignore rules
│
├── 🌐 netlify/functions/            # Serverless backend functions
│   ├── 🤖 gemini-proxy.ts          # Secure AI API proxy
│   ├── ⚙️ tsconfig.json            # TypeScript configuration
│   └── 📁 .dist/                   # Compiled functions (auto-generated)
│
├── 🏠 index.html                    # Main application entry point
├── ⚛️ index.tsx                     # React application root
├── 📱 App.tsx                       # Main App component
├── 🔧 constants.ts                  # Application constants
├── 📝 types.ts                      # TypeScript type definitions
│
├── 🧩 components/                   # Reusable UI components
│   ├── 📷 Camera/                   # Camera capture components
│   ├── 📋 Screens/                  # Main screen components
│   └── 🎨 UI/                       # Common UI elements
│
├── 🔄 contexts/                     # React Context providers
│   ├── 📊 ScreeningContext.tsx      # Screening state management
│   └── ⚙️ SettingsContext.tsx       # Application settings
│
├── 🔧 services/                     # External service integrations
│   ├── 🤖 geminiService.ts          # AI analysis service
│   ├── 💾 localStorageService.ts    # Data persistence
│   └── 🔗 deviceService.ts          # Medical device integration
│
└── 🎣 hooks/                        # Custom React hooks
    ├── 📷 useCamera.ts              # Camera functionality
    ├── 🔗 useDeviceIntegration.ts   # Device connectivity
    └── 💾 useLocalStorage.ts        # Storage management
```

## 🆘 **SUPPORT & HELP**

### **📖 Getting Help**
1. **📚 Check Documentation**: Start with the relevant guide above
2. **🔍 Search Issues**: Look through existing GitHub issues
3. **🐛 Report Bugs**: Create a new issue with detailed information
4. **💡 Request Features**: Open an enhancement request
5. **💬 Ask Questions**: Use GitHub Discussions for general questions

### **🚨 Emergency Support**
For critical issues affecting patient care:
1. **📋 Check [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)** for immediate solutions
2. **📞 Contact your IT support team** for technical issues
3. **🩺 Use backup manual procedures** if system is unavailable
4. **📝 Document the issue** for follow-up resolution

### **📞 Contact Information**
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/thechildclinic/funsense/issues)
- **💡 Feature Requests**: [GitHub Issues](https://github.com/thechildclinic/funsense/issues) with enhancement label
- **💬 General Questions**: [GitHub Discussions](https://github.com/thechildclinic/funsense/discussions)
- **🔒 Security Issues**: [security@yourschool.edu] (replace with your contact)

## 📄 **LICENSE & ACKNOWLEDGMENTS**

### **📜 License**
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **🙏 Acknowledgments**
- **🤖 Google Gemini AI** for intelligent health analysis capabilities
- **⚛️ React Team** for the excellent frontend framework
- **🎨 Tailwind CSS** for beautiful and responsive styling
- **🏥 Medical Device Manufacturers** for API documentation and support
- **👩‍⚕️ Healthcare Professionals** for requirements gathering and testing
- **🏫 Educational Institutions** for feedback and real-world testing

### **🔗 Related Projects**
- **[Google Gemini API](https://ai.google.dev/)** - AI analysis engine
- **[Netlify](https://netlify.com)** - Deployment and hosting platform
- **[Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)** - Device connectivity
- **[React](https://react.dev)** - Frontend framework

---

## 🎯 **READY TO GET STARTED?**

### **👥 For Healthcare Staff**
📖 **Start with**: [Team Training Manual](TEAM_TRAINING_MANUAL.md)

### **🔧 For IT/Developers**
📖 **Start with**: [Developer Integration Guide](DEVELOPER_INTEGRATION_GUIDE.md)

### **🚀 For Deployment**
📖 **Start with**: [Deployment Completion Checklist](DEPLOYMENT_COMPLETION_CHECKLIST.md)

### **🔗 For Device Setup**
📖 **Start with**: [Device Integration Guide](DEVICE_INTEGRATION_GUIDE.md)

---

**🏥 Transform your school health screening process with AI-powered efficiency and accuracy!**

**⭐ Star this repository if you find it helpful!**

**🤝 Contributions welcome - see [Contributing](#-contributing) section above**

