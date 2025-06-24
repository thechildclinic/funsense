# Deployment Guide for School Health Screening System

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Netlify account**
4. **Google Gemini API Key**
5. **Git repository** (GitHub, GitLab, or Bitbucket)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
API_KEY=your_actual_gemini_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Build Functions

Compile the TypeScript Netlify functions:
```bash
npm run build:functions
```

### 4. Start Development Server

Using Netlify Dev (recommended):
```bash
npm run netlify:dev
```

Or using Vite directly:
```bash
npm run dev
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests Once
```bash
npm run test:run
```

### Type Checking
```bash
npm run lint
```

## Netlify Deployment

### 1. Push to Git Repository

Ensure your code is pushed to a Git provider (GitHub, GitLab, Bitbucket).

### 2. Create Netlify Site

1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository

### 3. Build Settings

Netlify should automatically detect settings from `netlify.toml`:
- **Build command**: `npm run netlify:build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions/.dist`

### 4. Environment Variables

In your Netlify site dashboard:
1. Go to "Site configuration" → "Environment variables"
2. Add the following variables:
   - `API_KEY`: Your Google Gemini API key
   - `GEMINI_API_KEY`: Your Google Gemini API key (same value)

### 5. Deploy

Click "Deploy site". Netlify will:
1. Install dependencies
2. Build the functions
3. Build the frontend
4. Deploy everything

## Build Commands Reference

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run build:functions` - Compile TypeScript functions
- `npm run netlify:build` - Build both functions and frontend
- `npm run preview` - Preview production build locally
- `npm run netlify:dev` - Start Netlify development environment

## Troubleshooting

### Common Issues

1. **API Key not working**: Ensure the API key is set in Netlify environment variables
2. **Functions not found**: Check that `npm run build:functions` runs successfully
3. **CORS errors**: Verify the API redirects in `netlify.toml`
4. **Build failures**: Check Node.js version (should be 18+)

### Logs

- Check Netlify build logs in the dashboard
- Use `netlify dev` locally to debug function issues
- Check browser console for frontend errors

## Security Notes

- Never commit `.env` files to version control
- API keys are only accessible to Netlify functions, not the frontend
- All API calls go through the secure Netlify function proxy

## Performance Optimization

The build is optimized with:
- Code splitting for vendor libraries
- Source maps for debugging
- Proper caching headers
- Compressed assets
