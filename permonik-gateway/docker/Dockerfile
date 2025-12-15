FROM debian:trixie-slim

RUN apt-get update && \
    apt-get install -y apache2 libapache2-mod-shib nano iproute2 supervisor

RUN a2enmod shib \
    && a2enmod proxy \
    && a2enmod proxy_http \
    && a2enmod headers \
    && a2enmod rewrite

COPY ./permonik-gateway/docker/apache-conf/permonik-site.conf /etc/apache2/sites-available/permonik-site.conf
COPY ./permonik-gateway/docker/apache-conf/ports.conf /etc/apache2/ports.conf

RUN a2dissite 000-default.conf && \
    a2ensite permonik-site.conf

COPY ./permonik-gateway/docker/supervisord.conf /supervisord.conf

COPY ./permonik-gateway/docker/start-shibd.sh /start-shibd.sh
RUN chmod +x /start-shibd.sh

COPY ./permonik-gateway/docker/start-apache.sh /start-apache.sh
RUN chmod +x /start-apache.sh

RUN mkdir -p /run/supervisord

ENTRYPOINT ["/usr/bin/supervisord", "-c", "/supervisord.conf"]
