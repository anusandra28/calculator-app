# Start from a small web server image
FROM nginx:alpine
# Copy the calculator files into the web server folder
COPY . /usr/share/nginx/html/
# The web server listens on port 80 inside the container
EXPOSE 80


