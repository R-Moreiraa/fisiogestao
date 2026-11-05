FROM php:8.2-apache

# Reliable PHP extension installer
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN install-php-extensions mbstring curl zip

# Enable Apache modules
RUN a2enmod rewrite headers

# Point DocumentRoot to /var/www/html/public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Copy backend files
WORKDIR /var/www/html
COPY . .

# Create writable storage and fix permissions
RUN mkdir -p storage \
    && chmod -R 777 storage \
    && chown -R www-data:www-data /var/www/html

# Copy and prepare entrypoint (adjusts Apache port to match Railway's $PORT)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
