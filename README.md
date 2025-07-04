# 🏥 AI-Powered Health Screening System

> **Complete school health screening solution with AI integration, professional reporting, and emergency navigation**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/satishskid/skidscameraAIscreen)

## 1. Description

The School Health Screening System is a comprehensive web-based application designed to assist nurses and healthcare professionals in conducting systematic health screenings for students. It leverages AI-powered analysis for various checks, including anthropometry (BMI, height, weight, arm span), Optical Character Recognition (OCR) for device readings, and observational analysis for ENT (Ear, Nose, Throat) and dental health via connected cameras. The application follows a step-by-step workflow, allows for manual data entry fallbacks, supports partial completion of modules by different nurses, and facilitates data export and summary report generation.

This system is built for illustrative and educational purposes to showcase potential AI integration in health screening processes. It is NOT a diagnostic tool and all AI-generated suggestions or reports require validation by qualified medical professionals. The system is designed with a conceptual backend in mind; data marked as "complete" by nurses is intended for submission to a central server for aggregated doctor review.

## 2. Features

*   **Student Identification:** QR code simulation and manual entry for student details, including pre-existing conditions.
*   **Flexible Screening Workflow:** Step-by-step guidance with top-tab navigation allowing nurses to work on specific modules.
*   **Modular Design:** Modules for Anthropometry, Specialized Imaging (ENT, Dental), Vital Signs (BP, SpO2, Temperature, Hemoglobin), and Review.
*   **Multi-Nurse Collaboration (Shared Device):** Nurses can complete their assigned modules for a student, save, and return to the student list. Another nurse can then pick up the same student's record on the same device to complete other modules.
*   **Module Skipping:** Option to skip entire modules with a reason.
*   **Camera Integration:**
    *   Capture images for anthropometry (height, arm span - with tap-to-measure), weighing scale display, device vitals display, ENT/Dental examination, face wellness observation, and stethoscope placement context.
    *   Video capture for ENT/Dental (first frame used for immediate AI analysis).
*   **AI-Powered Analysis (via Google Gemini API - `gemini-2.5-flash-preview-04-17` through a secure Netlify Function proxy):**
    *   OCR for reading values from device displays.
    *   Interpretation of BMI.
    *   Descriptive analysis of ENT and Dental images/video frames.
    *   Silhouette observation from height images.
    *   Simulated general wellness observation from face images.
    *   Simulated educational text for stethoscope auscultation.
    *   Generation of a comprehensive AI summary report.
*   **Tap-to-Measure:** Interactive height and arm span measurement by tapping points on a captured image with a reference ruler.
*   **Manual Data Entry:** Fallback options for all measurements, with fields for reasons.
*   **Nurse Observation Input:** Dedicated section for nurses' general qualitative observations, pre-populated with contextual prompts.
*   **Data Persistence & Workflow:**
    *   In-progress screening data is saved to browser `localStorage` for same-device session resumption.
    *   Explicit "Save Progress" buttons within each module.
    *   "Save & Return to Student List" button in modules for multi-nurse workflow.
*   **Review & Submission:**
    *   Comprehensive review screen displaying all collected data.
    *   Field for "Preliminary Notes for Doctor / Referral Notes".
    *   "Mark Complete & Submit" button to (conceptually) send data to a backend server.
    *   Export screening data as a JSON file.
    *   Print view for the report.
*   **Application Settings:**
    *   Modal for selecting preferred camera/microphone.
    *   Option to clear all cached screening data from `localStorage`.
*   **Responsive Design:** Optimized for tablet/mobile use.

## 3. Technology Stack

*   **Frontend:** React (v19+), TypeScript
*   **Styling:** Tailwind CSS (via CDN), Font Awesome (for icons)
*   **AI Integration:** Google Gemini API (`@google/genai` SDK) via Netlify Functions
*   **State Management:** React Context API (`ScreeningContext`, `SettingsContext`)
*   **Browser Storage:** `localStorage` for session persistence and settings.
*   **Module System:** ES Modules directly in the browser using import maps (via esm.sh).
*   **Backend Proxy:** Netlify Functions (Node.js/TypeScript)

## 4. Prerequisites

*   A modern web browser (Chrome, Firefox, Edge, Safari).
*   Internet connectivity.
*   A valid Google Gemini API Key.
*   (Optional) External USB/BT camera for ENT/Dental.
*   Node.js and npm (or yarn/pnpm) for local development of Netlify Functions and for Netlify's build process.
*   A Netlify account.
*   A Git client (for pushing to a Git provider).
*   (Optional) Netlify CLI for local testing and deployment (`npm install -g netlify-cli`).

## 5. API Key Management (IMPORTANT)

The Google Gemini API Key is sensitive. It **MUST NOT** be exposed in the frontend JavaScript code. This application uses a **Netlify Function as a secure proxy**.

*   The frontend makes requests to a Netlify Function endpoint (e.g., `/api/gemini-proxy`).
*   This serverless function (running on Netlify's backend) securely accesses your `API_KEY` from Netlify's environment variables.
*   The function then calls the Gemini API and returns the response to the frontend.

You will set your `API_KEY` in the Netlify project settings (see Deployment section).

## 5.1. Testing & Quality Assurance

This project includes comprehensive testing and quality assurance measures:

*   **Unit Tests**: Component and service testing with Vitest
*   **Integration Tests**: Frontend-backend communication testing
*   **Type Safety**: Full TypeScript coverage with strict mode
*   **Performance Optimization**: Code splitting, caching, and PWA features
*   **Security**: Secure API proxy, CSP headers, and data protection

## 6. Getting Started (Local Development with Netlify Dev)

1.  **Clone the repository (or download the ZIP and extract).**
    If you downloaded a ZIP, initialize a Git repository in the project's root folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Install dependencies:** This installs dependencies needed for the Netlify Function (like `@google/genai` and `typescript`). In your project's root folder, run:
    ```bash
    npm install
    ```
3.  **Set up environment variable for local testing:**
    Create a file named `.env` in the root of your project. Add your Gemini API key to it:
    ```
    API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE
    ```
    Netlify Dev will automatically load this `.env` file. **Important: Do not commit the `.env` file to your Git repository.** Ensure it's listed in your `.gitignore` file (if you don't have one, create it and add `.env` to it).
4.  **Run with Netlify Dev:** This command will serve your static files (like `index.html`), compile your TypeScript functions, and run them locally. From your project's root folder, run:
    ```bash
    netlify dev
    ```
    This command uses the `build:functions` script defined in your `package.json` (which runs `tsc` in the `netlify/functions` directory) to compile your TypeScript functions into the `netlify/functions/.dist` directory.
5.  Open the local URL provided by `netlify dev` (usually `http://localhost:8888`) in your browser.
6.  Grant camera/microphone permissions when prompted by the browser.

Ensure your Gemini API Key is active and has the necessary permissions/quotas for the `gemini-2.5-flash-preview-04-17` model.

## 7. Netlify Deployment Instructions

1.  **Push your code to a Git provider:**
    *   Create a new repository on a platform like GitHub, GitLab, or Bitbucket.
    *   Follow the provider's instructions to push your local Git repository (including `netlify.toml`, `package.json`, and the `netlify/functions` directory with your `.ts` source files) to the remote repository.
2.  **Sign up/Log in to Netlify.**
3.  **Create a new site from Git:**
    *   In your Netlify dashboard, click "Add new site" (or "Import project").
    *   Choose "Import an existing project".
    *   Connect to your Git provider and select the repository you just pushed.
4.  **Build Settings:**
    *   Netlify should automatically detect and use the settings from your `netlify.toml` file. These are typically:
        *   **Build command:** `npm run build:functions` (This script compiles your TypeScript functions).
        *   **Publish directory:** `.` (The root directory of your project, where `index.html` is located).
        *   **Functions directory:** `netlify/functions/.dist` (The output directory where your compiled JavaScript functions are placed by the build command).
    *   If you need to review or set these manually (though `netlify.toml` is preferred):
        *   Go to "Site configuration" -> "Build & deploy".
        *   **Base directory:** (leave blank or set to your project's root if it's in a subdirectory of your Git repo).
        *   **Build command:** `npm run build:functions`
        *   **Publish directory:** `.`
        *   **Functions directory (under "Functions" section):** `netlify/functions/.dist` (This tells Netlify where to find the *deployed* functions).
5.  **Environment Variables:**
    *   Go to your site's "Site configuration" (or "Site settings") -> "Build & deploy" -> "Environment".
    *   Under "Environment variables", click "Edit variables".
    *   Add an environment variable:
        *   **Key:** `API_KEY`
        *   **Value:** `YOUR_ACTUAL_GEMINI_API_KEY_HERE`
    *   This key will be securely available to your deployed Netlify Functions at runtime.
6.  **Deploy:** Click "Deploy site" (or "Trigger deploy" if it's an existing site). Netlify will:
    *   Clone your repository.
    *   Run `npm install` to get dependencies for your functions.
    *   Execute your build command (`npm run build:functions`).
    *   Deploy your static files from the publish directory.
    *   Deploy your compiled functions from the functions directory.
7.  Access your live site via the URL provided by Netlify (e.g., `your-site-name.netlify.app`).
8.  **Troubleshooting:** If your functions aren't working, check the "Functions" tab in your Netlify site dashboard for logs. Ensure the `API_KEY` is set correctly and that your build command ran successfully.

## 8. Project Structure Overview

```
.
├── netlify.toml              # Netlify configuration (build, functions, redirects)
├── package.json              # Project dependencies (for Netlify functions) & build scripts
├── .env                      # Local environment variables (e.g., API_KEY, DO NOT COMMIT)
├── .gitignore                # Specifies intentionally untracked files (e.g., .env, node_modules)
│
├── netlify/
│   └── functions/
│       ├── gemini-proxy.ts   # Serverless function for Gemini API (TypeScript source)
│       ├── tsconfig.json     # TypeScript config for compiling functions
│       └── .dist/            # (Generated by 'npm run build:functions') Compiled JS functions
│
├── index.html                # Main HTML entry point
├── index.tsx                 # Main React application entry
├── metadata.json             # Frame permissions (if specific to an environment)
├── App.tsx                   # Root React component
├── constants.ts              # Global constants, prompts, icons mapping
├── types.ts                  # TypeScript type definitions
│
├── components/               # Reusable UI components
│   └── ... 
│
├── contexts/                 # React Context providers
│   └── ... 
│
├── screens/                  # Top-level screen components and step components
│   └── ... 
│
├── services/                 # Service integrations
│   ├── geminiService.ts      # Client-side service to call the Netlify proxy function
│   └── localStorageService.ts # Manages browser's localStorage
├── README.md                 # This file
└── USER_MANUAL.md            # User guide for the application
```

## 9. Core Concepts

*   **Netlify Functions:** Used as a secure backend proxy for API key management. Written in TypeScript, compiled to JavaScript by the `npm run build:functions` script (which uses `tsc`).
*   **Screening Context (`ScreeningContext.tsx`):** Manages state for the *active* student screening session.
*   **Settings Context (`SettingsContext.tsx`):** Manages application-wide settings like preferred devices.
*   **Gemini Service (`geminiService.ts`):** Client-side module that calls the Netlify Function proxy at `/api/gemini-proxy`. The `netlify.toml` redirects this path to the actual function.
*   **Local Storage Service (`localStorageService.ts`):** Persists incomplete screenings and app settings in the browser.

## 10. Key Dependencies

*   **Frontend (via CDN/esm.sh in `index.html`):** React, ReactDOM, Tailwind CSS, React Icons, Recharts.
*   **Netlify Function (via `package.json`):** `@google/genai`.
*   **Development (via `package.json`):** `typescript`, `@types/node`.

## 11. Important Notes & Limitations

*   **API Key Security:** The Google Gemini API key is managed securely using Netlify environment variables and accessed only by the backend Netlify Function.
*   **Simulations:** Stethoscope and Face Wellness features are simulated/educational. Video analysis uses the first frame for nurse-UI feedback.
*   **Non-Diagnostic:** This is a screening tool, not for diagnosis. Medical professional validation is essential.
*   **Single Device Focus (Currently):** While designed for multi-nurse module completion, `localStorage` persistence is per-device. True multi-device, real-time collaboration would require a more complex backend.
*   **Error Handling:** Basic error handling is present. Production systems would require more robust strategies.
*   **Build Process:** The frontend (React/TSX) is handled directly by the browser using import maps and `esm.sh` (no separate frontend build step). The `npm run build:functions` script is *only* for compiling the TypeScript Netlify Functions to JavaScript.
*   **Favicon/CSS Errors:** If you see 404 errors for `favicon.ico` or `index.css`, these are minor. The app uses Tailwind via CDN, so `index.css` is likely not needed unless you added custom global styles. Browsers often request `favicon.ico` by default.
*   **MIME Type Error for `.tsx`:** If you are *not* using `netlify dev` and are serving files with a very basic static server locally, you might see MIME type errors for `.tsx` files. `netlify dev` or a proper deployment (like on Netlify) handles serving these correctly for the browser's ES module system.
```