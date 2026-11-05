#!/bin/bash
set -e

# Railway sets the PORT environment variable dynamically.
# Apache defaults to port 80. We need to align them.
PORT="${PORT:-80}"

echo "[entrypoint] Starting Apache on port ${PORT}..."

# Update ports.conf to listen on $PORT
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/Listen 443/Listen 443/g" /etc/apache2/ports.conf

# Update VirtualHost to use $PORT
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# Start Apache in foreground
exec apache2-foreground
