# PHP Backend Dockerfile for Render
FROM php:8.2-apache

# Enable mod_rewrite for clean URLs
RUN a2enmod rewrite

# Install PHP extensions (mysqli for MySQL)
RUN docker-php-ext-install mysqli

# Copy API files to Apache web root
COPY myapp/api/ /var/www/html/api/

# Apache config: allow .htaccess overrides
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/myapp.conf \
 && a2enconf myapp

# Create .htaccess for clean routing
RUN echo 'RewriteEngine On\n\
RewriteCond %{REQUEST_FILENAME} !-f\n\
RewriteRule ^(.*)$ index.php [QSA,L]' > /var/www/html/api/.htaccess

EXPOSE 80
