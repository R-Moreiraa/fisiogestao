FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install curl mbstring \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite and headers
RUN a2enmod rewrite headers

# Create Apache VirtualHost with DocumentRoot pointing to /var/www/html/public
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Copy only backend files (Dockerfile is inside backend/, context root is repo root)
# Railway uses repo root as build context, so copy backend/ subfolder
COPY backend/ .

# Create writable storage directory
RUN mkdir -p storage && chmod -R 777 storage

# Fix ownership
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
