FROM debian:buster-slim

RUN apt-get update && \
    apt-get install -y apache2 libapache2-mod-shib2 ntp --no-install-recommends

RUN a2enmod shib

COPY ./permonik-shibboleth-sp/docker/apache-conf/shib-site.conf /etc/apache2/sites-available/shib-site.conf
COPY ./permonik-shibboleth-sp/docker/apache-conf/httpd.conf /usr/local/apache2/conf/httpd.conf

RUN a2dissite 000-default.conf && \
    a2ensite shib-site.conf

COPY ./permonik-shibboleth-sp/docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
