#!/bin/bash

# Deployment script for School Health Screening System
# This script performs pre-deployment checks and deploys to Netlify

set -e  # Exit on any error

echo "🚀 Starting deployment process for School Health Screening System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check if environment variables are set
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Make sure to set environment variables in Netlify."
    else
        if ! grep -q "API_KEY" .env; then
            print_warning "API_KEY not found in .env file. Make sure it's set in Netlify."
        fi
    fi
    
    print_success "Environment check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Type checking
    print_status "Running type check..."
    npm run lint
    
    # Unit tests
    print_status "Running unit tests..."
    npm run test:run
    
    print_success "All tests passed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build functions
    print_status "Building Netlify functions..."
    npm run build:functions
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    # Run optimization script if it exists
    if [ -f "scripts/optimize-build.js" ]; then
        print_status "Running build optimizations..."
        node scripts/optimize-build.js
    fi
    
    print_success "Build completed successfully"
}

# Validate build output
validate_build() {
    print_status "Validating build output..."
    
    if [ ! -d "dist" ]; then
        print_error "Build output directory 'dist' not found"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "index.html not found in build output"
        exit 1
    fi
    
    if [ ! -d "netlify/functions/.dist" ]; then
        print_error "Compiled functions not found"
        exit 1
    fi
    
    # Check build size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    print_status "Build size: $BUILD_SIZE"
    
    print_success "Build validation passed"
}

# Deploy to Netlify
deploy_to_netlify() {
    print_status "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        # Using Netlify CLI
        print_status "Using Netlify CLI for deployment..."
        
        # Check if site is linked
        if [ ! -f ".netlify/state.json" ]; then
            print_warning "Site not linked. Please run 'netlify link' first or deploy via Git."
            return
        fi
        
        # Deploy
        netlify deploy --prod --dir=dist --functions=netlify/functions/.dist
        print_success "Deployed via Netlify CLI"
    else
        print_warning "Netlify CLI not found. Please deploy via Git push or install Netlify CLI."
        print_status "To deploy via Git:"
        print_status "  git add ."
        print_status "  git commit -m 'Deploy: $(date)'"
        print_status "  git push origin main"
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Deployment Report

**Date**: $(date)
**Version**: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
**Build Size**: $(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
**Node Version**: $(node --version)
**npm Version**: $(npm --version)

## Build Output
\`\`\`
$(ls -la dist/ 2>/dev/null || echo "Build directory not found")
\`\`\`

## Functions
\`\`\`
$(ls -la netlify/functions/.dist/ 2>/dev/null || echo "Functions directory not found")
\`\`\`

## Environment
- API_KEY: $([ -f .env ] && grep -q "API_KEY" .env && echo "✓ Set" || echo "⚠ Not found in .env")
- Build Command: npm run netlify:build
- Publish Directory: dist
- Functions Directory: netlify/functions/.dist

## Checklist
- [x] Dependencies installed
- [x] Tests passed
- [x] Build completed
- [x] Build validated
- [ ] Deployed successfully
- [ ] Post-deployment testing

## Notes
Add any deployment notes here...
EOF
    
    print_success "Deployment report generated: $REPORT_FILE"
}

# Main deployment process
main() {
    echo "=================================================="
    echo "  School Health Screening System Deployment"
    echo "=================================================="
    
    # Pre-deployment checks
    check_dependencies
    check_environment
    
    # Install and test
    install_dependencies
    run_tests
    
    # Build and validate
    build_application
    validate_build
    
    # Generate report
    generate_report
    
    # Deploy
    deploy_to_netlify
    
    echo "=================================================="
    print_success "Deployment process completed!"
    echo "=================================================="
    
    print_status "Next steps:"
    print_status "1. Verify the deployment at your Netlify URL"
    print_status "2. Test all major functionality"
    print_status "3. Check the deployment report: $(ls deployment-report-*.md | tail -1)"
    print_status "4. Monitor for any issues"
    
    if [ -f ".env" ]; then
        print_warning "Remember to set environment variables in Netlify dashboard!"
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check-only   Only run checks without deploying"
        echo "  --build-only   Only build without deploying"
        echo ""
        echo "Environment variables:"
        echo "  SKIP_TESTS=1   Skip running tests"
        echo ""
        exit 0
        ;;
    --check-only)
        check_dependencies
        check_environment
        print_success "Checks completed"
        exit 0
        ;;
    --build-only)
        check_dependencies
        install_dependencies
        if [ "${SKIP_TESTS:-}" != "1" ]; then
            run_tests
        fi
        build_application
        validate_build
        print_success "Build completed"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        print_status "Use --help for usage information"
        exit 1
        ;;
esac
