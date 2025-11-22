#!/bin/bash

# Simple create-flexium test script

set -e

echo "🧪 Testing create-flexium templates..."
echo ""

# Create temp directory
TEST_DIR="/tmp/flexium-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "1️⃣ Testing Vite template creation..."
printf "1\n" | npx create-flexium@latest vite-test > /dev/null 2>&1
if [ -f "vite-test/package.json" ]; then
  echo "✅ Vite template created"
  cd vite-test
  npm install --silent 2>&1 > /dev/null
  echo "✅ Dependencies installed"
  npm run build --silent 2>&1 > /dev/null
  echo "✅ Build successful"
  cd ..
else
  echo "❌ Vite template failed"
  exit 1
fi

echo ""
echo "2️⃣ Testing counter reactivity..."
cd vite-test/src
if grep -q "{count}" main.tsx; then
  echo "✅ Signal reactivity pattern found"
else
  echo "❌ Signal reactivity pattern NOT found (should use {count}, not {count.value})"
  exit 1
fi
cd "$TEST_DIR"

echo ""
echo "🎉 All tests passed!"
echo ""
echo "Cleaning up: $TEST_DIR"
rm -rf "$TEST_DIR"
