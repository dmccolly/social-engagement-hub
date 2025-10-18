#!/bin/bash

echo "=== TESTING ALL SECTIONS ==="
echo ""

# Test if server is running
echo "Checking server status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    exit 1
fi

echo ""
echo "Testing sections by checking page content..."
echo ""

# Get the main page
PAGE=$(curl -s http://localhost:3000)

# Check for navigation elements
if echo "$PAGE" | grep -q "Blog"; then
    echo "✅ Navigation includes Blog"
else
    echo "❌ Navigation missing Blog"
fi

if echo "$PAGE" | grep -q "Email"; then
    echo "✅ Navigation includes Email"
else
    echo "❌ Navigation missing Email"
fi

if echo "$PAGE" | grep -q "News Feed"; then
    echo "✅ Navigation includes News Feed"
else
    echo "❌ Navigation missing News Feed"
fi

if echo "$PAGE" | grep -q "Admin"; then
    echo "✅ Navigation includes Admin"
else
    echo "❌ Navigation missing Admin"
fi

if echo "$PAGE" | grep -q "Analytics"; then
    echo "✅ Navigation includes Analytics"
else
    echo "❌ Navigation missing Analytics"
fi

if echo "$PAGE" | grep -q "Settings"; then
    echo "✅ Navigation includes Settings"
else
    echo "❌ Navigation missing Settings"
fi

echo ""
echo "=== MANUAL TESTING REQUIRED ==="
echo "Please visit: https://3000-6bf05363-31d9-45a8-a8cd-3ed1bf550547.proxy.daytona.works"
echo "And click through each tab to verify content"