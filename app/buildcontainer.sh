#!/bin/bash

./gradlew clean build
docker build -t metrics-app --build-arg=JAR_FILE=build/libs/app.jar .
# see runlocal.sh and runontc.sh for launching the container
