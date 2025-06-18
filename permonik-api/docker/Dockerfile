# syntax = docker/dockerfile:1

## BUILD image ##
FROM gradle:8.14-jdk24 AS builder
WORKDIR /build

# Run build
RUN \
    --mount=type=cache,id="permonik-api-gradle-home",target="/gradle-home" \
    --mount=type=cache,id="permonik",target="/build" \
    --mount=type=bind,source="settings.gradle",target="/host/settings.gradle" \
    --mount=type=bind,source="gradle.properties",target="/host/gradle.properties" \
    --mount=type=bind,source="lombok.config",target="/host/lombok.config" \
    --mount=type=bind,source="permonik-api",target="/host/permonik-api" \
    cp /host/settings.gradle ./settings.gradle && \
    cp /host/gradle.properties ./gradle.properties && \
    cp /host/lombok.config ./lombok.config && \
    cp -rT /host/permonik-api ./permonik-api && \
    echo "config.stopBubbling = true" >> ./permonik-api/lombok.config && \
    gradle -g /gradle-home --no-daemon :permonik-api:build -x :permonik-api:test && \
    java -Djarmode=layertools -jar ./permonik-api/build/libs/permonik-api.jar extract --destination /extracted

## RUN Image ##
FROM eclipse-temurin:24-jre

RUN apt update
RUN apt install nano mc -y

WORKDIR /app

COPY --from=builder /extracted/dependencies /app
COPY --from=builder /extracted/snapshot-dependencies /app
COPY --from=builder /extracted/spring-boot-loader /app
COPY --from=builder /extracted/application /app
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
