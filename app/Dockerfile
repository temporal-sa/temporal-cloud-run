FROM openjdk:8
ARG JAR_FILE=JAR_FILE_MUST_BE_SPECIFIED_AS_BUILD_ARG
ENV APP_COMMANDS=""
COPY ${JAR_FILE} app.jar

#ENTRYPOINT echo "$APP_COMMANDS"
ENTRYPOINT java \
#    -Xmx382293K \
#    -XX:MaxMetaspaceSize=64M \
#    -Xss995K \
#    -Xms82293K \
    -Djava.security.edg=file:/dev/./urandom \
    $APP_COMMANDS \
    -jar app.jar
