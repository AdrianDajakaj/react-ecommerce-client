#!/bin/bash


set -e

echo "🐳 Building React Frontend Docker Image..."

docker build -t react-ecommerce-frontend:latest .

echo "✅ Build completed successfully!"

echo "🧪 Testing the container..."

CONTAINER_ID=$(docker run -d -p 3000:80 --name react-ecommerce-test react-ecommerce-frontend:latest)

echo "⏳ Waiting for container to start..."
sleep 5

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Container is responding on http://localhost:3000"
    echo "🌐 You can now test the frontend at: http://localhost:3000"
    echo ""
    echo "📝 Commands:"
    echo "  View logs: docker logs $CONTAINER_ID"
    echo "  Stop container: docker stop $CONTAINER_ID"
    echo "  Remove container: docker rm $CONTAINER_ID"
    echo "  Remove image: docker rmi react-ecommerce-frontend:latest"
else
    echo "❌ Container is not responding"
    echo "📋 Container logs:"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    exit 1
fi

echo ""
echo "🎉 Frontend container is running successfully!"
echo "Press Ctrl+C to stop watching logs, container will keep running"
echo ""

docker logs -f $CONTAINER_ID
