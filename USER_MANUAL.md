# School Health Screening System - User Manual

## 1. Introduction

### Purpose of the Application
Welcome to the School Health Screening System! This application helps nurses conduct comprehensive student health screenings efficiently using camera-based measurements and AI-powered insights.

### Target Users
Nurses and authorized healthcare personnel.

### IMPORTANT DISCLAIMER
This is a screening tool, **NOT for diagnosis.** AI suggestions and reports **MUST be validated by a qualified medical doctor.** Medical judgment is paramount.

## 2. Getting Started

### Accessing the Application
Open `index.html` in a modern web browser (Chrome, Edge, etc.) on your computer or tablet. Internet is needed for AI features.

### Browser Requirements & Permissions
Use an up-to-date browser. **Allow camera and microphone permissions** when prompted.

## 3. Application Settings (Gear Icon <i class="fas fa-cog"></i>)
Before starting, or at any time, you can access settings by clicking the <i class="fas fa-cog"></i> gear icon, usually at the top right.
*   **Preferred Camera/Microphone:** If your device has multiple cameras/microphones, you can select your preferred one here for the app to try using first.
*   **Clear All Cached Screening Data:** This button will remove ALL incomplete screening data saved in the browser's local storage. Use with caution – it's for clearing old/stuck data and cannot be undone.
*   **Device SDK Connections:** Placeholder for future integrations (e.g., specific medical devices).

## 4. Starting a Screening Session

1.  **Enter Student ID (Simulates QR Scan):**
    *   Type the student's ID. Click **"Start with Student ID"**. Mock data may pre-fill.
2.  **Enter Student Manually:**
    *   Click **"Enter Student Manually"**.
    *   Fill in: ID (Required), Name (Required), Age, Gender, **Pre-existing Conditions / Known Diseases** (e.g., "Asthma, Peanut Allergy"), and Reason for Manual Entry.
    *   Click **"Start Screening"**.
*   **Resuming a Session:** If a screening for this student was started earlier on *this device* and not submitted, you might be prompted to resume it.

## 5. Navigating Screening Modules

A header shows the current student. Top tabs allow direct navigation to modules: "Student Identification," "Anthropometry," "Specialized Imaging," "Vital Signs," "Review & Export." Grayed-out/struck-through tabs indicate skipped modules.

*   **"Next Step" / "Previous" Buttons:** For sequential navigation between *available* modules.
*   **Saving Progress:**
    *   Each module has a **"Save [Module Name] Data"** button (e.g., <i class="fas fa-save"></i> Save Anthropometry Data). Click this to save your current work for that student and module. A "Saved!" message appears briefly. Data is also saved automatically with major actions like BMI calculation.
*   **"Save & Return to Student List" Button:**
    *   After completing your assigned part(s) for a student, click the **"<i class="fas fa-list-alt"></i> Save & Return to Student List"** button (or similar name) at the bottom of a data entry module. This saves the current module's data and takes you back to the main start screen to select another student. The current student's record remains in `localStorage` for others (or yourself later) to continue on the same device.
*   **Skipping a Module:**
    1.  Click **"<i class="fas fa-ban"></i> Skip Module"** within a module.
    2.  Enter a "Reason for skipping."
    3.  Click **"Confirm Skip & Proceed"**.
    *   **Unskipping:** Navigate to a skipped module. Click **"<i class="fas fa-redo"></i> Unskip & Enter Data"**. Entering data also unskips it.

## 6. Detailed Module Walkthrough

### 6.1. Student Identification (Confirmation)
*   Review student details (including Pre-existing Conditions). Click **"Proceed to Anthropometry"**.

### 6.2. Anthropometry (Height, Weight, BMI, Arm Span, Body Type)
*   **Height Measurement (Tap-to-Measure):**
    *   **Instructions:** Follow guide for positioning student at a fixed station with a visible ruler.
    *   **Capture Image:** Click **"<i class="fas fa-camera"></i> Capture Height Image"**.
    *   **Tap Points:**
        1.  Follow on-screen prompts: "Tap top of student's head," then "Tap bottom of student's feet," then "Tap a known point on the ruler," then "Tap another known point on the ruler."
        2.  Small red dots will appear where you tap. Use **"<i class="fas fa-eraser"></i> Reset Height Points"** if you make a mistake.
    *   **Enter Ruler Reference:** In "Known Ruler Reference Length (cm)," type the actual distance between the two points you tapped on the ruler (e.g., if you tapped the 10cm and 60cm marks, enter "50").
    *   **Calculate:** Click **"Calculate Height from Taps"**. The estimated height appears.
    *   **Confirm:** Enter/edit the height in "Confirmed Height (cm)." Note reason for override if any.
    *   AI provides a "Silhouette Observation" based on the image.
*   **Arm Span Measurement (Tap-to-Measure):**
    *   Similar to height: Capture image, tap fingertips.
    *   **Uses Ruler Reference from Height section.** Ensure that is set.
    *   Click **"Calculate Arm Span from Taps"**. Confirm/edit value.
*   **Observed Body Type:** Select from dropdown. AI Silhouette can guide this.
*   **Weight Measurement:**
    *   Click **"<i class="fas fa-camera"></i> Capture Scale Image"**. AI OCR attempts to read weight.
    *   Confirm/enter weight in "Weight (kg)."
*   **BMI Calculation & AI Interpretation:**
    *   Click **"<i class="fas fa-save"></i> Calculate & Interpret BMI"**. Result and AI interpretation shown.
*   **Save & Return:** Use **"<i class="fas fa-save"></i> Save Progress"** or **"<i class="fas fa-list-alt"></i> Save & Return to Student List"**.

### 6.3. Specialized Imaging (ENT & Dental)
Use an external camera if possible. Switch between "ENT" and "Dental" tabs.
*   **For Ear, Nose, Throat, Oral Cavity/Teeth:**
    *   **Capture:** Click **"<i class="fas fa-camera"></i> Capture Img"** or **"<i class="fas fa-video"></i> Capture Vid (5s)"**.
    *   AI analyzes the image/first video frame and provides observations.
    *   Enter your **"Nurse Notes"**.
*   Note reason if skipping any part.
*   **Save & Return:** Use **"<i class="fas fa-save"></i> Save Imaging Data"** or **"<i class="fas fa-list-alt"></i> Save & Return to Student List"**.

### 6.4. Vital Signs
*   **Face Wellness Observation (Simulated):** Capture face image. AI gives general, simulated observation.
*   **Stethoscope Auscultation (Educational Simulation):**
    *   **Disclaimer:** Educational text, NOT real audio analysis.
    *   Capture image of stethoscope placement. Click **"Sim. Heart/Lungs Edu-Text"**.
*   **Device-Based Vitals (BP, SpO2, Temperature, Hemoglobin):**
    *   For each vital (e.g., Blood Pressure):
        *   Choose **"Scan Device"** or **"Manual Entry"** tab.
        *   **Scan:** Click **"<i class="fas fa-camera"></i> Scan [Vital] Device"**. Capture image of device display. AI OCR attempts to read value(s).
        *   **Manual/Confirm:** Enter/confirm values (e.g., Systolic/Diastolic for BP; single value for SpO2, Temp, Hb). Note reason for manual entry if needed.
*   **Save & Return:** Use **"<i class="fas fa-save"></i> Save Vital Signs"** or **"<i class="fas fa-list-alt"></i> Save & Return to Student List"**.

### 6.5. Review & Export (Final Step for a Student's Record)
Review all collected data. Images/videos are displayed. Skipped modules are noted.
*   **Nurse's General Observations:** Add overall notes. A contextual prompt is provided.
*   **AI Generated Summary Draft:** Click **"Generate/Regenerate Summary"**. AI creates a report draft.
*   **Preliminary Notes for Doctor / Referral Notes:** Add any specific notes for the reviewing doctor.
*   **Save Report Data:** Click **"<i class="fas fa-save"></i> Save Report Data"** to save these final notes.
*   **Export & Print:**
    *   **"<i class="fas fa-share-square"></i> Export JSON"**: Downloads all data as a JSON file.
    *   **"<i class="fas fa-print"></i> Print View"**: Opens browser's print dialog.
*   **Mark Complete & Submit:**
    *   Once ALL necessary modules for the student are complete by the nursing team, click **"<i class="fas fa-upload"></i> Mark Complete & Submit"**.
    *   This (conceptually) submits the data to a central server for doctor review.
    *   After successful submission, the student's data is cleared from this tablet, and you return to the Start Screen.
    *   If submission fails (simulated), data remains locally; you can retry or export JSON.

## 7. Troubleshooting & Tips
*   **Camera Issues:** Check permissions, close other apps using camera. Use "Flip Camera" (<i class="fas fa-sync"></i>) if available.
*   **AI Errors:** Check internet. Service might be busy. API Key issues are for admins.
*   **Data Saving:** Use module "Save" buttons. In-progress data is saved to browser's local storage (same device).
*   **"Save & Return to Student List"** is your primary way to switch students after doing your part.
*   **Clear Instructions to Student:** Crucial for good captures.

Thank you for using the School Health Screening System!