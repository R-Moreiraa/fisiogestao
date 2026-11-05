#!/bin/bash
set -e

PORT="${PORT:-8080}"
echo "[entrypoint] Starting FisioGestão Apache on port ${PORT}..."

# 1. Fix MPM conflict: strictly ensure ONLY mpm_prefork is active
rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf
ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

# 2. Update Apache listening port to Railway dynamic $PORT
echo "Listen ${PORT}" > /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# 3. Handle DocumentRoot location
if [ -d "/var/www/html/backend/public" ]; then
    echo "[entrypoint] Detected root repo context, setting DocumentRoot to /var/www/html/backend/public"
    sed -ri "s!DocumentRoot .*!DocumentRoot /var/www/html/backend/public!g" /etc/apache2/sites-available/000-default.conf
    mkdir -p /var/www/html/backend/storage && chmod -R 777 /var/www/html/backend/storage
else
    echo "[entrypoint] Setting DocumentRoot to /var/www/html/public"
    sed -ri "s!DocumentRoot .*!DocumentRoot /var/www/html/public!g" /etc/apache2/sites-available/000-default.conf
    mkdir -p /var/www/html/storage && chmod -R 777 /var/www/html/storage
fi

exec apache2-foreground
