# 🛠️ Health Screening System - Developer Manual

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [API Integration](#api-integration)
6. [Deployment Guide](#deployment-guide)
7. [Customization Guide](#customization-guide)
8. [Testing & Debugging](#testing--debugging)

---

## 🏗️ Architecture Overview

### Technology Stack
```
Frontend:
├── React 19.1.0 (TypeScript)
├── Tailwind CSS (Styling)
├── Vite (Build Tool)
├── React Icons (UI Icons)
└── Context API (State Management)

Backend:
├── Netlify Functions (Serverless)
├── TypeScript (Type Safety)
└── Google GenAI SDK

AI Integration:
├── Google Gemini API
├── OpenAI API Support
├── Anthropic Claude Support
└── Local AI Models
```

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │ Netlify Functions│    │   AI Providers  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │◄──►│ │ gemini-proxy │ │◄──►│ │ Gemini API  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │                  │    │ ┌─────────────┐ │
│ │ Contexts    │ │    │                  │    │ │ OpenAI API  │ │
│ └─────────────┘ │    │                  │    │ └─────────────┘ │
│ ┌─────────────┐ │    │                  │    │ ┌─────────────┐ │
│ │ Services    │ │    │                  │    │ │ Claude API  │ │
│ └─────────────┘ │    │                  │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 Setup & Installation

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git
Modern Browser (Chrome/Firefox/Safari/Edge)
```

### Local Development Setup

#### 1. Clone Repository
```bash
# Clone from main repository
git clone https://github.com/thechildclinic/funsense.git
cd funsense

# Or clone from your repository
git clone https://github.com/satishskid/skidscameraAIscreen.git
cd skidscameraAIscreen
```

#### 2. Install Dependencies
```bash
# Install main dependencies
npm install

# Install Netlify Functions dependencies
cd netlify/functions
npm install
cd ../..
```

#### 3. Environment Configuration
```bash
# Create environment file
touch .env.local

# Add required variables
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" >> .env.local
echo "API_KEY=your_gemini_api_key_here" >> .env.local
```

#### 4. Development Server
```bash
# Start development server (port 5700)
npm run dev

# Or specify custom port
npm run dev -- --port 5700
```

#### 5. Build Functions
```bash
# Build Netlify functions
npm run build:functions

# Or build everything
npm run netlify:build
```

### Environment Variables
```bash
# Required for AI functionality
VITE_GEMINI_API_KEY=your_gemini_api_key
API_KEY=your_gemini_api_key

# Optional for other AI providers
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key

# Development settings
NODE_VERSION=18
```

---

## 📁 Project Structure

```
health-screening-system/
├── 📁 components/              # Reusable UI components
│   ├── EmergencyResetButton.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   └── SettingsModal.tsx
├── 📁 contexts/               # React Context providers
│   ├── ScreeningContext.tsx
│   └── SettingsContext.tsx
├── 📁 docs/                   # Documentation
│   ├── USER_MANUAL.md
│   └── DEVELOPER_MANUAL.md
├── 📁 netlify/               # Netlify configuration
│   └── 📁 functions/         # Serverless functions
│       ├── gemini-proxy.ts
│       ├── gemini-proxy.test.ts
│       └── tsconfig.json
├── 📁 screens/               # Main application screens
│   ├── ScreeningFlow.tsx
│   ├── StartScreeningScreen.tsx
│   └── 📁 screening_steps/   # Individual screening steps
│       ├── AnthropometryStep.tsx
│       ├── DermatologyStep.tsx
│       ├── ImagingStep.tsx
│       ├── PatientInfoStep.tsx
│       ├── ReviewAndExportStep.tsx
│       └── VitalSignsStep.tsx
├── 📁 services/              # Business logic & API calls
│   ├── geminiService.ts
│   └── localStorageService.ts
├── 📁 styles/                # Styling files
│   ├── print.css
│   └── index.css
├── 📁 types/                 # TypeScript type definitions
│   └── index.ts
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
├── constants.ts              # Application constants
├── index.html               # HTML template
├── netlify.toml             # Netlify configuration
├── package.json             # Dependencies & scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

---

## 🧩 Core Components

### Context Providers

#### ScreeningContext
```typescript
// Manages screening session data
interface ScreeningContextType {
  screeningData: ScreeningData;
  updateScreeningData: (data: Partial<ScreeningData>) => void;
  resetScreening: () => void;
  currentStudentId: string | null;
  setCurrentStudentId: (id: string | null) => void;
}
```

#### SettingsContext
```typescript
// Manages device and application settings
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  availableCameras: MediaDeviceInfo[];
  availableMicrophones: MediaDeviceInfo[];
  refreshDevices: () => Promise<void>;
}
```

### Key Components

#### EmergencyResetButton
```typescript
// Emergency navigation and system recovery
interface EmergencyResetButtonProps {
  onReset: () => void;    // Full application reset
  onHome: () => void;     // Navigate to home
  className?: string;
}
```

#### SettingsModal
```typescript
// Configuration interface for devices and AI
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Screening Steps Architecture
```typescript
// Base interface for all screening steps
interface ScreeningStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onScreeningComplete?: () => void;
}

// Each step implements this interface:
// - PatientInfoStep
// - AnthropometryStep  
// - VitalSignsStep
// - ImagingStep
// - DermatologyStep
// - ReviewAndExportStep
```

---

## 🔌 API Integration

### Netlify Functions

#### gemini-proxy.ts
```typescript
// Serverless function for AI API calls
interface RequestBody {
  action: 'generateText' | 'analyzeImage' | 'ocr' | 'analyzeAudio';
  prompt?: string;
  base64ImageData?: string;
  mimeType?: string;
  simulatedInputType?: string;
}

// Supported AI providers
const AI_PROVIDERS = {
  gemini: 'Google Gemini',
  openai: 'OpenAI GPT',
  claude: 'Anthropic Claude',
  local: 'Local AI Models'
};
```

#### API Endpoints
```typescript
// POST /.netlify/functions/gemini-proxy
{
  "action": "generateText",
  "prompt": "Analyze this medical data...",
  "provider": "gemini",
  "apiKey": "your-api-key"
}

// Response
{
  "result": "AI analysis result...",
  "status": "success"
}
```

### AI Service Integration

#### geminiService.ts
```typescript
// Client-side AI service wrapper
export const generateTextWithGemini = async (
  prompt: string,
  provider: string = 'gemini'
): Promise<string> => {
  const response = await fetch('/.netlify/functions/gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generateText',
      prompt,
      provider
    })
  });
  
  const data = await response.json();
  return data.result;
};
```

### Adding New AI Providers

#### 1. Update gemini-proxy.ts
```typescript
// Add new provider configuration
const AI_PROVIDERS = {
  // ... existing providers
  newProvider: {
    name: 'New AI Provider',
    apiUrl: 'https://api.newprovider.com',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }
};
```

#### 2. Update SettingsModal.tsx
```typescript
// Add to aiProviders array
const aiProviders = [
  // ... existing providers
  { 
    id: 'newProvider', 
    name: 'New AI Provider', 
    description: 'Description of new provider' 
  }
];
```

---

## 🚀 Deployment Guide

### Netlify Deployment

#### 1. Netlify Configuration (netlify.toml)
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

#### 2. Build Scripts (package.json)
```json
{
  "scripts": {
    "dev": "vite --port 5700",
    "build": "vite build",
    "build:functions": "cd netlify/functions && tsc",
    "netlify:build": "npm run build:functions && npm run build",
    "preview": "vite preview"
  }
}
```

#### 3. Environment Variables Setup
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
NODE_VERSION=18
```

### Manual Deployment Steps

#### 1. Build Project
```bash
# Install dependencies
npm install

# Build functions and app
npm run netlify:build

# Verify build output
ls -la dist/
ls -la netlify/functions/.dist/
```

#### 2. Deploy to Netlify
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist --functions=netlify/functions/.dist
```

### Custom Domain Setup
```bash
# In Netlify Dashboard
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)
```

---

## 🎨 Customization Guide

### Theming & Styling

#### 1. Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3B82F6',
        'brand-dark-blue': '#1E40AF',
        'brand-light-blue': '#DBEAFE'
      }
    }
  }
}
```

#### 2. Custom CSS Variables
```css
/* styles/index.css */
:root {
  --primary-color: #3B82F6;
  --secondary-color: #10B981;
  --danger-color: #EF4444;
  --warning-color: #F59E0B;
}
```

### Adding New Screening Steps

#### 1. Create Step Component
```typescript
// screens/screening_steps/NewStep.tsx
import React from 'react';
import { useScreeningContext } from '../../contexts/ScreeningContext';

interface NewStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const NewStep: React.FC<NewStepProps> = ({ onNext, onPrevious }) => {
  const { screeningData, updateScreeningData } = useScreeningContext();
  
  // Component implementation
  return (
    <div className="screening-step">
      {/* Step content */}
    </div>
  );
};

export default NewStep;
```

#### 2. Update ScreeningFlow
```typescript
// screens/ScreeningFlow.tsx
import NewStep from './screening_steps/NewStep';

// Add to steps array
const steps = [
  // ... existing steps
  { 
    component: NewStep, 
    title: 'New Step', 
    icon: FaNewIcon 
  }
];
```

#### 3. Update Types
```typescript
// types/index.ts
export interface ScreeningData {
  // ... existing fields
  newStepData?: {
    field1: string;
    field2: number;
  };
}
```

### Customizing Print Layout

#### 1. Update Print Stylesheet
```css
/* styles/print.css */
.custom-print-section {
  page-break-inside: avoid;
  border: 1px solid #000;
  padding: 10pt;
  margin: 10pt 0;
}

.custom-header {
  font-size: 16pt;
  font-weight: bold;
  text-align: center;
}
```

#### 2. Modify Print Generation
```typescript
// In ReviewAndExportStep.tsx
const generateCustomSection = (): string => {
  return `
    <div class="custom-print-section">
      <h3 class="custom-header">Custom Section</h3>
      <!-- Custom content -->
    </div>
  `;
};
```

---

## 🧪 Testing & Debugging

### Development Testing

#### 1. Component Testing
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test
```

#### 2. Function Testing
```typescript
// netlify/functions/gemini-proxy.test.ts
import { describe, it, expect } from 'vitest';
import { handler } from './gemini-proxy';

describe('Gemini Proxy Function', () => {
  it('should handle generateText action', async () => {
    // Test implementation
  });
});
```

### Debugging Tools

#### 1. Browser DevTools
```javascript
// Add debug logging
console.log('Screening Data:', screeningData);
console.log('AI Response:', aiResponse);

// Performance monitoring
console.time('AI Analysis');
// ... AI call
console.timeEnd('AI Analysis');
```

#### 2. Network Debugging
```javascript
// Monitor API calls
fetch('/.netlify/functions/gemini-proxy', {
  method: 'POST',
  body: JSON.stringify(requestData)
})
.then(response => {
  console.log('Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response Data:', data);
});
```

### Common Issues & Solutions

#### 1. Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run netlify:build
```

#### 2. Function Deployment Issues
```bash
# Check function compilation
cd netlify/functions
npx tsc --noEmit

# Verify function structure
ls -la .dist/
```

#### 3. Environment Variable Issues
```bash
# Check environment variables
echo $API_KEY
echo $VITE_GEMINI_API_KEY

# Verify in Netlify dashboard
netlify env:list
```

---

## 📚 Additional Resources

### Documentation Links
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Google Gemini API**: https://ai.google.dev/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

### Development Tools
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets
- **Browser Extensions**: React Developer Tools
- **Testing Tools**: Vitest, Testing Library
- **Deployment**: Netlify CLI

### Support & Community
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Keep this manual updated
- **Code Reviews**: Follow established patterns
- **Security**: Regular dependency updates

---

*This developer manual provides comprehensive guidance for maintaining and extending the Health Screening System. For user-facing documentation, see the User Manual.*
