# React E-Commerce Frontend - Docker Setup

This directory contains the Docker configuration for the React e-commerce frontend.

## 🚀 Quick Start

### Build the image
```bash
docker build -t react-ecommerce-frontend .
```

### Run the container
```bash
docker run -d -p 3000:80 --name react-frontend react-ecommerce-frontend
```

### Test the deployment
```bash
./docker-test.sh
```

## 🔧 Configuration

### Build Arguments

You can customize the API URL during build:

```bash
docker build --build-arg REACT_APP_API_URL=https://your-api.com -t react-ecommerce-frontend .
```

### Environment Variables

- `REACT_APP_API_URL` - API backend URL (default: http://localhost:8080)

## 📁 Files

- `Dockerfile` - Multi-stage build configuration
- `nginx.conf` - Nginx configuration for serving React app
- `.dockerignore` - Files to exclude from Docker build context
- `docker-test.sh` - Local testing script

## 🏗️ Build Process

1. **Build Stage**: Uses Node.js Alpine to build the React application
2. **Production Stage**: Uses Nginx Alpine to serve the built static files

## ✨ Features

- ✅ Multi-stage build for smaller image size
- ✅ Nginx configuration optimized for React Router
- ✅ Gzip compression enabled
- ✅ Security headers configured
- ✅ Health check endpoint (`/health`)
- ✅ Static asset caching
- ✅ Dockerfile best practices

## 🧪 Testing

The container includes a health check that verifies the service is responding:

```bash

docker ps


curl http://localhost:3000/health


curl http://localhost:3000
```

## 🐳 Docker Compose Usage

This Dockerfile is designed to work with the main project's `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - REACT_APP_API_URL=http://api:8080
    ports:
      - "3000:80"
```

## 📊 Image Information

- **Base Images**: 
  - Build: `node:20-alpine` 
  - Production: `nginx:alpine`
- **Final Size**: ~25MB (approximate)
- **Exposed Port**: 80
- **Health Check**: Enabled

## 🛠️ Development

For local development, you can mount your source code:

```bash

docker run -v $(pwd)/src:/app/src -p 3000:80 react-ecommerce-frontend
```

## 🔍 Troubleshooting

### Build Issues

1. **TypeScript errors**: Make sure all TypeScript files are valid
2. **Missing dependencies**: Check `package.json` includes all required packages
3. **Build context too large**: Review `.dockerignore` file

### Runtime Issues

1. **502 errors**: Check if Nginx configuration is correct
2. **404 on routes**: Ensure `try_files` directive is configured for React Router
3. **API connection**: Verify `REACT_APP_API_URL` is set correctly

### Logs

```bash

docker logs <container-id>


docker logs -f <container-id>
```
