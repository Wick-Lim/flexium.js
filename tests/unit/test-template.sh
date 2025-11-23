#!/bin/bash

# create-flexium 템플릿 자동 테스트 스크립트

set -e  # 에러 발생시 중단

echo "🧪 Starting create-flexium template tests..."

# 임시 디렉토리 생성
TEST_DIR="/tmp/flexium-test-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo ""
echo "📦 Testing Vite + TypeScript template..."
echo "1" | npx create-flexium@latest vite-test

cd vite-test
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "✅ Vite template test passed!"

cd "$TEST_DIR"

echo ""
echo "📦 Testing Vanilla template..."
echo "2" | npx create-flexium@latest vanilla-test

if [ -f "vanilla-test/index.html" ]; then
  echo "✅ Vanilla template test passed!"
else
  echo "❌ Vanilla template test failed!"
  exit 1
fi

cd "$TEST_DIR"

echo ""
echo "📦 Testing Todo App template..."
echo "3" | npx create-flexium@latest todo-test

cd todo-test
echo "📥 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "✅ Todo template test passed!"

echo ""
echo "🎉 All template tests passed!"
echo ""
echo "Cleaning up test directory: $TEST_DIR"
rm -rf "$TEST_DIR"

echo "✨ Done!"
