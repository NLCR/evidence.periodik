FROM eclipse-temurin:25-jdk-alpine

RUN apk add --no-cache gcompat libstdc++

RUN addgroup -g 65532 -S developer \
    && adduser -u 65532 -S -D -G developer -h /home/developer developer

ENV GRADLE_USER_HOME=/home/developer/.gradle
WORKDIR /workspace

COPY --chown=65532:65532 gradle ./gradle
COPY --chown=65532:65532 gradlew build.gradle settings.gradle gradle.properties lombok.config ./
COPY --chown=65532:65532 permonik-api ./permonik-api
COPY --chown=65532:65532 permonik-domain ./permonik-domain
COPY --chown=65532:65532 permonik-core-contract ./permonik-core-contract
COPY --chown=65532:65532 permonik-export-api ./permonik-export-api
COPY --chown=65532:65532 permonik-identity-gateway ./permonik-identity-gateway

RUN chown 65532:65532 /workspace
USER 65532:65532

RUN chmod +x gradlew \
    && ./gradlew --no-daemon --max-workers=2 -Dorg.gradle.jvmargs=-Xmx768m \
      :permonik-api:classes \
      :permonik-export-api:classes \
      :permonik-identity-gateway:classes
