FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y shibboleth-sp2-schemas libapache2-mod-shib2 apache2 && \
    a2enmod shib2 ssl

# Spustí shibd + apache
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
