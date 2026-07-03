#!/bin/bash
set -e

echo "🔨 Building Ogbenjuwa Central Command..."

# Install dependencies
npm install

# Run TypeScript compilation
npx tsc -p server/tsconfig.json 2>/dev/null || npx tsc

# Build admin panel
cd admin && npm install && npm run build && cd ..

echo "✅ Build complete!"
