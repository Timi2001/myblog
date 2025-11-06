#!/bin/bash

# Production Build Script for Personal Blog
# This script prepares and builds the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting production build process..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.production.local exists
if [ ! -f ".env.production.local" ]; then
    print_warning ".env.production.local not found. Make sure to configure production environment variables."
    if [ -f ".env.production.example" ]; then
        print_status "You can copy .env.production.example to .env.production.local and update the values."
    fi
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf out
print_success "Cleaned previous builds"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Run type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed. Please fix TypeScript errors before building."
    exit 1
fi

# Run linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting issues found. Consider fixing them for better code quality."
fi

# Set production environment
export NODE_ENV=production

# Build the application
print_status "Building Next.js application for production..."
if npm run build:production; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

# Check build output
if [ -d ".next" ]; then
    print_success "Build output directory (.next) created successfully"
    
    # Show build size information
    print_status "Build size information:"
    du -sh .next
    
    # Check for large bundles
    if [ -d ".next/static/chunks" ]; then
        print_status "Checking for large JavaScript bundles..."
        find .next/static/chunks -name "*.js" -size +500k -exec ls -lh {} \; | while read line; do
            print_warning "Large bundle detected: $line"
        done
    fi
else
    print_error "Build output directory not found. Build may have failed."
    exit 1
fi

# Verify critical files exist
print_status "Verifying critical build files..."

critical_files=(
    ".next/BUILD_ID"
    ".next/static"
    ".next/server"
)

for file in "${critical_files[@]}"; do
    if [ -e "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

# Check for common issues
print_status "Checking for common production issues..."

# Check for console.log statements in production build
if grep -r "console\.log" .next/static/chunks/ 2>/dev/null; then
    print_warning "console.log statements found in production build. Consider removing them."
fi

# Check for development dependencies in production
if [ "$NODE_ENV" = "production" ]; then
    dev_deps=$(npm ls --depth=0 --production=false 2>/dev/null | grep -c "devDependencies" || echo "0")
    if [ "$dev_deps" -gt 0 ]; then
        print_warning "Development dependencies detected. Make sure they're not included in production."
    fi
fi

# Generate build report
print_status "Generating build report..."
cat > build-report.txt << EOF
Production Build Report
Generated: $(date)
Node.js Version: $(node --version)
npm Version: $(npm --version)
Build Size: $(du -sh .next | cut -f1)
Environment: production

Build Status: SUCCESS
Type Check: PASSED
Lint Check: $(npm run lint >/dev/null 2>&1 && echo "PASSED" || echo "WARNING")

Critical Files:
$(for file in "${critical_files[@]}"; do echo "- $file: $([ -e "$file" ] && echo "EXISTS" || echo "MISSING")"; done)

Next Steps:
1. Test the build locally with: npm run preview
2. Deploy to Vercel with: npm run deploy:vercel
3. Verify deployment at your production URL
4. Run post-deployment tests

EOF

print_success "Build report generated: build-report.txt"

# Final success message
print_success "🎉 Production build completed successfully!"
print_status "Next steps:"
echo "  1. Test locally: npm run preview"
echo "  2. Deploy to Vercel: npm run deploy:vercel"
echo "  3. Monitor deployment and run tests"

# Optional: Start preview server
read -p "Would you like to start the preview server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting preview server..."
    npm run preview
fi