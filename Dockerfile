FROM nginx:alpine

# Copy website files into nginx html directory
COPY www/ /var/www/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
