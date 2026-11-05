FROM php:8.2-apache

# Install PHP extensions and Apache modules
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libonig-dev \
        libzip-dev \
        zip \
        unzip \
    && docker-php-ext-install mbstring curl zip \
    && a2enmod rewrite headers \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Allow .htaccess overrides in all directories
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Copy application files
WORKDIR /var/www/html
COPY . .

# Setup entrypoint script
RUN if [ -f /var/www/html/entrypoint.sh ]; then \
        cp /var/www/html/entrypoint.sh /entrypoint.sh; \
    elif [ -f /var/www/html/backend/entrypoint.sh ]; then \
        cp /var/www/html/backend/entrypoint.sh /entrypoint.sh; \
    fi && chmod +x /entrypoint.sh

EXPOSE 80 8080

CMD ["/entrypoint.sh"]
