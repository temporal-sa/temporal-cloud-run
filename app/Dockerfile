FROM eclipse-temurin:11 AS jre-builder
ARG JAR_FILE=JAR_FILE_MUST_BE_SPECIFIED_AS_BUILD_ARG

# Install necessary tools for jlink
RUN apt-get update; apt-get install -y wget ca-certificates zip unzip

WORKDIR /app

COPY ${JAR_FILE} .
# expand the jar for jdep to work
RUN jar xf app.jar

# run jdeps to determine what modules are in use
RUN jdeps --print-module-deps --ignore-missing-deps --multi-release 11 -cp 'BOOT-INF/lib/*' BOOT-INF/classes | grep -v "not found" | grep -v "JDK removed internal API" > jre-deps.info

# Use jlink to create a custom JRE
RUN jlink --compress=2 --strip-debug --no-header-files --no-man-pages \
          --add-modules $(cat jre-deps.info) \
          --output /opt/jre

# Use a base image for your application
FROM debian:buster-slim
ARG JAR_FILE=JAR_FILE_MUST_BE_SPECIFIED_AS_BUILD_ARG
ENV APP_COMMANDS=""

# Copy the custom JRE from previous build stage
COPY --from=jre-builder /opt/jre /opt/jre

# Set PATH to use the custom JRE
ENV PATH="/opt/jre/bin:${PATH}"

# Set working directory
WORKDIR /app

# copy application JAR to container
COPY ${JAR_FILE} .

#ENTRYPOINT echo "$APP_COMMANDS"
ENTRYPOINT java \
#    -Xmx382293K \
#    -XX:MaxMetaspaceSize=64M \
#    -Xss995K \
#    -Xms82293K \
    -Djava.security.edg=file:/dev/./urandom \
    $APP_COMMANDS \
    -jar app.jar
