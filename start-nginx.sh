#!/bin/sh
set -e

# Ensure nginx can write to necessary directories
if [ ! -w /var/cache/nginx ]; then
    echo "Warning: Cannot write to /var/cache/nginx"
fi

if [ ! -w /var/log/nginx ]; then
    echo "Warning: Cannot write to /var/log/nginx"
fi

# Start nginx in foreground mode
exec nginx -g "daemon off;"
