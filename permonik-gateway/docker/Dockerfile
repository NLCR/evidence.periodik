FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y apache2 libapache2-mod-shib ntp nano iproute2 --no-install-recommends

RUN a2enmod shib

COPY ./permonik-gateway/docker/apache-conf/permonik-site.conf /etc/apache2/sites-available/permonik-site.conf
COPY ./permonik-gateway/docker/apache-conf/ports.conf /etc/apache2/ports.conf

RUN a2dissite 000-default.conf && \
    a2ensite permonik-site.conf

COPY ./permonik-gateway/docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
