FROM httpd:alpine


RUN apk --update --no-cache add busybox-extras curl
# Apache conf
COPY ./permonik-gateway/docker/apache-conf/httpd.conf /usr/local/apache2/conf/httpd.conf
