# ==========================================
# Stage 1: Build React/Vite Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the frontend (outputs to /app/dist)
RUN npm run build

# ==========================================
# Stage 2: Serve PHP Backend & Static Frontend
# ==========================================
FROM php:8.2-apache

# Enable mod_rewrite + headers mod
RUN a2enmod rewrite headers

# Install PHP extensions (mysqli and pdo_mysql for MySQL)
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 1. Copy the built React frontend from Stage 1 into the Apache root
COPY --from=builder /app/dist/ /var/www/html/

# 2. Copy API files to /api/
COPY myapp/api/ /var/www/html/api/

# Apache config
RUN echo '<Directory /var/www/html>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    DirectoryIndex index.html index.php\n\
</Directory>' > /etc/apache2/conf-available/myapp.conf \
 && a2enconf myapp

# .htaccess for the root (React Router fallback)
# This ensures that URLs like /login or /flow/123 don't throw 404, but are handled by React
RUN printf 'RewriteEngine On\nRewriteBase /\nRewriteCond %%{REQUEST_URI} !^/api/ [NC]\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteCond %%{REQUEST_FILENAME} !-d\nRewriteRule ^.*$ index.html [L]\n' \
    > /var/www/html/.htaccess

# .htaccess for /api/ — clean routing + pass Authorization header to PHP
RUN printf 'RewriteEngine On\nCGIPassAuth On\nSetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteRule ^(.*)$ index.php [QSA,L]\n' \
    > /var/www/html/api/.htaccess

EXPOSE 80
