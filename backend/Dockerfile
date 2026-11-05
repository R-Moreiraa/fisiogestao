FROM php:8.2-apache

# Install system dependencies and PHP extensions for cURL, OpenSSL and MBString
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install curl mbstring

# Enable Apache mod_rewrite for REST routing
RUN a2enmod rewrite headers

# Set DocumentRoot to public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configure directory permissions in apache
RUN echo "<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>" >> /etc/apache2/apache2.conf

# Copy application source
WORKDIR /var/www/html
COPY . .

# Ensure storage directory is writable
RUN mkdir -p storage && chmod -R 777 storage

EXPOSE 80

CMD ["apache2-foreground"]
