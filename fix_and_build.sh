#!/bin/bash
echo "=== Auto-fixing Dockerfile ==="

# Dockerfileが自動生成された後に修正
if [ -f "Dockerfile" ]; then
    # scoop install を削除
    sed -i 's/scoop install && //g' Dockerfile
    # cloudgate行を削除  
    sed -i '/yarn global add @elestio\/cloudgate/d' Dockerfile
    echo "✅ Dockerfile fixed!"
    
    # 修正結果を表示
    echo "=== Modified Dockerfile ==="
    cat Dockerfile | grep -A 2 -B 2 "Install dependencies"
else
    echo "❌ Dockerfile not found!"
    exit 1
fi

echo "=== Building Docker image ==="
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "=== Starting services ==="
    docker compose up -d
    
    echo "=== Service status ==="
    docker compose ps
else
    echo "❌ Build failed!"
    exit 1
fi
