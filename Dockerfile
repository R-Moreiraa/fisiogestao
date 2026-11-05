FROM php:8.2-apache

# Reliable PHP extension installer
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN install-php-extensions mbstring curl zip

# Fix MPM conflict: disable event, enable prefork (required for mod_php)
RUN a2dismod mpm_event || true \
    && a2dismod mpm_worker || true \
    && a2enmod mpm_prefork

# Enable Apache modules
RUN a2enmod rewrite headers php8.2

# Point DocumentRoot to /var/www/html/public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Allow .htaccess override
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Copy backend files
WORKDIR /var/www/html
COPY . .

# Create writable storage and fix permissions
RUN mkdir -p storage \
    && chmod -R 777 storage \
    && chown -R www-data:www-data /var/www/html

# Entrypoint adjusts Apache port to match Railway's $PORT env var
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
