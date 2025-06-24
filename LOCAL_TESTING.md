# Local Development and Testing Guide

## Prerequisites

Before starting local development, ensure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js) or **yarn**
3. **Git** for version control
4. **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies for both frontend and backend functions.

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API key:

```
API_KEY=your_actual_gemini_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important**: Never commit the `.env` file to version control.

## Development Commands

### Frontend Development

```bash
# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Functions

```bash
# Compile TypeScript functions
npm run build:functions

# The compiled functions will be in netlify/functions/.dist/
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Type checking
npm run lint
```

### Netlify Development

```bash
# Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# Start Netlify development environment
npm run netlify:dev
# or
netlify dev
```

This will:
- Start the frontend development server
- Compile and serve Netlify functions
- Set up proper routing and redirects
- Load environment variables from `.env`

## Testing Checklist

### 1. Frontend Tests

- [ ] All components render without errors
- [ ] User interactions work correctly
- [ ] State management functions properly
- [ ] Routing works as expected

### 2. Backend Function Tests

- [ ] Functions compile without TypeScript errors
- [ ] API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Environment variables are loaded

### 3. Integration Tests

- [ ] Frontend can communicate with backend functions
- [ ] Data flows correctly through the application
- [ ] localStorage operations work
- [ ] Camera/media permissions function

### 4. Manual Testing

#### Camera Functionality
1. Open the application
2. Start a screening
3. Test camera capture in different modules:
   - Height measurement
   - Weight scale reading
   - ENT examination
   - Dental examination
   - Device vital readings

#### AI Integration
1. Capture test images
2. Verify OCR functionality with device displays
3. Test image analysis features
4. Check error handling for API failures

#### Data Persistence
1. Start a screening
2. Enter some data
3. Refresh the page
4. Verify data is restored from localStorage

## Common Issues and Solutions

### 1. Camera Not Working

**Problem**: Camera permissions denied or not available

**Solutions**:
- Ensure you're using HTTPS (required for camera access)
- Check browser permissions
- Try a different browser
- Use `netlify dev` which provides HTTPS locally

### 2. API Key Errors

**Problem**: "API Key not configured" or "Invalid API key"

**Solutions**:
- Verify `.env` file exists and contains correct API key
- Restart the development server after changing `.env`
- Check that the API key is valid in Google AI Studio

### 3. Function Compilation Errors

**Problem**: TypeScript compilation fails

**Solutions**:
- Check `netlify/functions/tsconfig.json` configuration
- Ensure all dependencies are installed
- Run `npm run build:functions` to see detailed errors

### 4. Import/Module Errors

**Problem**: Module not found or import errors

**Solutions**:
- Verify all dependencies are installed
- Check import paths are correct
- Ensure TypeScript configuration is proper

## Performance Testing

### 1. Build Size Analysis

```bash
npm run build
# Check the dist/ folder size
du -sh dist/
```

### 2. Load Time Testing

1. Build the application: `npm run build`
2. Serve locally: `npm run preview`
3. Use browser dev tools to check:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

### 3. Function Performance

Test function response times:
- Text generation: Should be < 5 seconds
- Image analysis: Should be < 10 seconds
- OCR: Should be < 3 seconds

## Debugging Tips

### 1. Browser Console

Check for:
- JavaScript errors
- Network request failures
- Console warnings

### 2. Network Tab

Monitor:
- API request/response times
- Failed requests
- Response sizes

### 3. Function Logs

When using `netlify dev`, function logs appear in the terminal.

### 4. React DevTools

Install React DevTools browser extension to:
- Inspect component state
- Monitor context changes
- Debug re-renders

## Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Functions compile successfully
- [ ] Environment variables documented
- [ ] Build completes without errors
- [ ] Manual testing completed
- [ ] Performance is acceptable
- [ ] Error handling tested
