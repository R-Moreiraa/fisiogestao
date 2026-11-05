FROM php:8.2-apache

# Install PHP extensions + fix MPM in a single layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libonig-dev \
        libzip-dev \
        zip \
        unzip \
    && docker-php-ext-install mbstring curl zip \
    && a2dismod mpm_event mpm_worker 2>/dev/null; a2enmod mpm_prefork \
    && a2enmod rewrite headers \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Point DocumentRoot to public/
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Copy backend files
WORKDIR /var/www/html
COPY . .

# Storage + permissions
RUN mkdir -p storage \
    && chmod -R 777 storage \
    && chown -R www-data:www-data /var/www/html

# Adjust Apache port to Railway's $PORT
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
