#!/bin/bash
# Complete Test Environment Setup
# Run this to validate and test the entire flow

set -e

echo "🚀 Hedera Testnet Environment Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Step 2: Validate environment
echo "🔧 Step 2: Validating environment..."
npx ts-node scripts/validate-env.ts
echo ""

# Step 3: Check if HCS topic exists
if grep -q "AUDIT_TOPIC_ID=0.0.xxxxx" .env 2>/dev/null || ! grep -q "AUDIT_TOPIC_ID" .env 2>/dev/null; then
    echo "📝 Step 3: Creating HCS Audit Topic..."
    echo "   (This creates a real topic on Hedera testnet)"
    echo ""
    npx ts-node scripts/setup-hcs-topic.ts
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Copy the Topic ID above to your .env file${NC}"
    echo "   Then run this script again."
    exit 0
else
    TOPIC_ID=$(grep "AUDIT_TOPIC_ID" .env | cut -d'=' -f2)
    echo -e "${GREEN}✓ HCS Topic configured: ${TOPIC_ID}${NC}\n"
fi

# Step 4: Test transfer
echo "💸 Step 4: Testing PolicyGuard transfer..."
echo "   (This will execute a real transaction on testnet)"
echo ""
npx ts-node scripts/test-transfer.ts
echo ""

echo "===================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "🎬 Ready for demo:"
echo "   1. npm run dev     (Start API server)"
echo "   2. npm run cli -- transfer 0.0.xxx 0.1"
echo ""
echo "📊 View your transactions:"
echo "   https://hashscan.io/testnet/account/$(grep HEDERA_ACCOUNT_ID .env | cut -d'=' -f2)"
