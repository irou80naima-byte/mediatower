# PHP Backend Dockerfile for Render
FROM php:8.2-apache

# Enable mod_rewrite + headers mod for Authorization forwarding
RUN a2enmod rewrite headers

# Install PHP extensions (mysqli for MySQL)
RUN docker-php-ext-install mysqli

# Copy API files to Apache web root under /api/
COPY myapp/api/ /var/www/html/api/

# Apache config:
# - Disable directory listing (Options -Indexes)
# - Allow .htaccess overrides
# - Set DirectoryIndex
RUN echo '<Directory /var/www/html>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    DirectoryIndex index.php index.html\n\
</Directory>' > /etc/apache2/conf-available/myapp.conf \
 && a2enconf myapp

# .htaccess for /api/ — clean routing + pass Authorization header to PHP
RUN printf 'RewriteEngine On\nCGIPassAuth On\nSetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteRule ^(.*)$ index.php [QSA,L]\n' \
    > /var/www/html/api/.htaccess

# Root-level index.php — returns API info JSON so root URL doesn't show directory listing
RUN printf '<?php\nheader("Content-Type: application/json; charset=utf-8");\necho json_encode(["name"=>"Mediatower PLAN API","version"=>"1.0.0","status"=>"online","api"=>"/api/index.php"], JSON_UNESCAPED_UNICODE);\n' \
    > /var/www/html/index.php

EXPOSE 80
