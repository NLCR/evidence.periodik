FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y apache2 libapache2-mod-shib ntp nano --no-install-recommends

RUN a2enmod shib

COPY ./permonik-shibboleth-sp/docker/apache-conf/shib-site.conf /etc/apache2/sites-available/shib-site.conf
COPY ./permonik-shibboleth-sp/docker/apache-conf/ports.conf /etc/apache2/ports.conf

RUN a2dissite 000-default.conf && \
    a2ensite shib-site.conf

COPY ./permonik-shibboleth-sp/docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
