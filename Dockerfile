FROM php:8.2-apache

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install curl mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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

# Set working directory
WORKDIR /app

# Copy backend files into /app
COPY backend/app ./app
COPY backend/config ./config
COPY backend/public ./public
COPY backend/routes ./routes
COPY backend/composer.json ./composer.json

# Create storage directory
RUN mkdir -p /app/storage && chmod -R 777 /app/storage

# Fix permissions
RUN chown -R www-data:www-data /app

# Update Apache to use /app as base
RUN sed -i 's|/var/www/html|/app|g' /etc/apache2/apache2.conf

EXPOSE 80

CMD ["apache2-foreground"]
