#!/bin/sh
set -e

# Health check script for nginx
# Checks if nginx is responding on port 8080

# Try to curl the health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
