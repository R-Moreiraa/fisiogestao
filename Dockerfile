FROM php:8.2-apache

# Use the reliable PHP extension installer (avoids apt-get issues)
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN install-php-extensions mbstring curl zip

# Enable Apache mod_rewrite and headers
RUN a2enmod rewrite headers

# Remove default site and create our VirtualHost
RUN rm -f /etc/apache2/sites-enabled/000-default.conf

RUN printf '<VirtualHost *:80>\n\
    ServerName localhost\n\
    DocumentRoot /app/public\n\
    <Directory /app/public>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>\n' > /etc/apache2/sites-available/fisiogestao.conf

RUN a2ensite fisiogestao.conf

WORKDIR /app

# Copy ALL backend files in one shot (avoids cache key issues)
COPY backend/ /app/

# Create writable storage directory and fix permissions
RUN mkdir -p /app/storage \
    && chmod -R 777 /app/storage \
    && chown -R www-data:www-data /app

EXPOSE 80

CMD ["apache2-foreground"]
