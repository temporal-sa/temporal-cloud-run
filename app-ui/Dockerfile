FROM eclipse-temurin:11 AS jre-builder
ARG JAR_FILE=JAR_FILE_MUST_BE_SPECIFIED_AS_BUILD_ARG

RUN apt-get update; apt-get install -y wget ca-certificates zip unzip

WORKDIR /app

COPY ${JAR_FILE} .
RUN jar xf app.jar

RUN jdeps --print-module-deps --ignore-missing-deps --multi-release 11 -cp 'BOOT-INF/lib/*' BOOT-INF/classes | grep -v "not found" | grep -v "JDK removed internal API" > jre-deps.info

RUN jlink --compress=2 --strip-debug --no-header-files --no-man-pages \
          --add-modules $(cat jre-deps.info) \
          --output /opt/jre

FROM debian:buster-slim
ARG JAR_FILE=JAR_FILE_MUST_BE_SPECIFIED_AS_BUILD_ARG
ENV APP_COMMANDS=""

COPY --from=jre-builder /opt/jre /opt/jre

ENV PATH="/opt/jre/bin:${PATH}"

WORKDIR /app

COPY ${JAR_FILE} .

ENTRYPOINT java \
    -Djava.security.edg=file:/dev/./urandom \
    $APP_COMMANDS \
    -jar app.jar
