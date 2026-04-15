#!/bin/bash

# Razorpay Compatibility Fix Verification Script
# Run this after npm install to verify everything is set up correctly

set -e

echo "🔍 Razorpay Compatibility Fix Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_count=0
pass_count=0

check_item() {
    check_count=$((check_count + 1))
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Check $check_count: $1"
        pass_count=$((pass_count + 1))
    else
        echo -e "${RED}✗${NC} Check $check_count: $1"
    fi
}

# Check 1: Wrapper files exist
echo "1️⃣  Checking wrapper module files..."
[ -f "src/modules/payment/providers/razorpay-compatibility/index.ts" ]
check_item "index.ts exists"

[ -f "src/modules/payment/providers/razorpay-compatibility/types.ts" ]
check_item "types.ts exists"

[ -f "src/modules/payment/providers/razorpay-compatibility/adapter.ts" ]
check_item "adapter.ts exists"

[ -f "src/modules/payment/providers/razorpay-compatibility/service-wrapper.ts" ]
check_item "service-wrapper.ts exists"

echo ""

# Check 2: Scripts exist
echo "2️⃣  Checking patch scripts..."
[ -f "scripts/fix-razorpay-compatibility.js" ]
check_item "fix-razorpay-compatibility.js exists"

[ -f "scripts/patch-razorpay-on-build.js" ]
check_item "patch-razorpay-on-build.js exists"

[ -f "patches/@tsc_tech+medusa-plugin-razorpay-payment+0.0.11.patch" ]
check_item "Patch file exists"

echo ""

# Check 3: API endpoints exist
echo "3️⃣  Checking API endpoints..."
[ -f "src/api/store/razorpay/webhooks/route.ts" ]
check_item "Webhook endpoint exists"

[ -f "src/api/admin/razorpay/health/route.ts" ]
check_item "Health check endpoint exists"

echo ""

# Check 4: Configuration files
echo "4️⃣  Checking configuration..."
[ -f "src/modules/payment/razorpay-config.ts" ]
check_item "razorpay-config.ts exists"

[ -f ".env.razorpay.example" ]
check_item ".env.razorpay.example exists"

echo ""

# Check 5: Documentation
echo "5️⃣  Checking documentation..."
[ -f "RAZORPAY_QUICK_START.md" ]
check_item "RAZORPAY_QUICK_START.md exists"

[ -f "RAZORPAY_COMPATIBILITY_GUIDE.md" ]
check_item "RAZORPAY_COMPATIBILITY_GUIDE.md exists"

[ -f "DEPLOYMENT_CHECKLIST.md" ]
check_item "DEPLOYMENT_CHECKLIST.md exists"

[ -f "IMPLEMENTATION_SUMMARY.md" ]
check_item "IMPLEMENTATION_SUMMARY.md exists"

echo ""

# Check 6: Node modules
echo "6️⃣  Checking node_modules..."
if [ -d "node_modules/@tsc_tech/medusa-plugin-razorpay-payment" ]; then
    echo -e "${GREEN}✓${NC} Check $((check_count+1)): Razorpay plugin installed"
    pass_count=$((pass_count + 1))
    check_count=$((check_count + 1))
    
    [ -f "node_modules/@tsc_tech/medusa-plugin-razorpay-payment/.medusa/server/src/providers/razorpay/index.js" ]
    check_item "Plugin provider file exists"
else
    echo -e "${YELLOW}⚠${NC}  Plugin not installed. Run: npm install"
    check_count=$((check_count + 1))
fi

echo ""

# Check 7: Environment configuration
echo "7️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
    if grep -q "RAZORPAY_ID" .env.local; then
        echo -e "${GREEN}✓${NC} Check $((check_count+1)): RAZORPAY_ID configured"
        pass_count=$((pass_count + 1))
    else
        echo -e "${YELLOW}⚠${NC}  RAZORPAY_ID not configured in .env.local"
    fi
    check_count=$((check_count + 1))
    
    if grep -q "RAZORPAY_SECRET" .env.local; then
        echo -e "${GREEN}✓${NC} Check $((check_count+1)): RAZORPAY_SECRET configured"
        pass_count=$((pass_count + 1))
    else
        echo -e "${YELLOW}⚠${NC}  RAZORPAY_SECRET not configured in .env.local"
    fi
    check_count=$((check_count + 1))
else
    echo -e "${YELLOW}⚠${NC}  .env.local not found. Create from .env.razorpay.example"
    check_count=$((check_count + 2))
fi

echo ""
echo "=========================================="
echo "📊 Results: $pass_count/$check_count checks passed"
echo ""

if [ $pass_count -eq $check_count ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to build and deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. npm run build"
    echo "2. npm start (or npm run dev for development)"
    echo "3. curl http://localhost:3000/admin/razorpay/health"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed or were skipped.${NC}"
    echo ""
    echo "Please review the items above and:"
    echo "1. Ensure all files were created correctly"
    echo "2. Run npm install if needed"
    echo "3. Configure .env.local with Razorpay credentials"
    echo ""
    echo "See RAZORPAY_QUICK_START.md for setup guide"
    exit 1
fi
