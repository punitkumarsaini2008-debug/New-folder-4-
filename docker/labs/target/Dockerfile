# ==============================================================================
# Online Cyber Lab - Designated Safe Internal Target (10.99.0.20)
# Hosts safe ports (80 HTTP, 21 FTP banner, 3306 test) for ethical scanning
# ==============================================================================

FROM nginx:alpine

# Custom Nginx configuration with challenge token header
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Lab-Target "Internal-Lab-20";' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Lab-Token "FLAG{http_header_token_recon_8820}";' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Custom index page
RUN echo '<!DOCTYPE html><html><head><title>Safe Lab Target 10.99.0.20</title></head><body><h1>Target Authorized for Nmap & HTTP Practice</h1><p>Inspect HTTP headers with curl -i to locate the hidden security token.</p></body></html>' > /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
