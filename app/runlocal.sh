#!/bin/bash

# be sure to set the TEMPORAL_NAMESPACE environment variable
if [ -z "${TEMPORAL_NAMESPACE}" ]
then
  echo "WARNING: You forgot to set the TEMPORAL_NAMESPACE environment variable. Setting to default."
  export TEMPORAL_NAMESPACE=default
fi

export SPRING_PROFILE="docker"
export TEMPORAL_ENDPOINT=host.docker.internal:7233
export APP_COMMANDS="-Dspring.profiles.active=$SPRING_PROFILE -Dspring.temporal.namespace=$TEMPORAL_NAMESPACE -Dspring.temporal.connection.target=$TEMPORAL_ENDPOINT"

echo "$APP_COMMANDS"
docker run \
  --publish 3030:8080 \
  --publish 3031:8081 \
  --env APP_COMMANDS="$APP_COMMANDS" \
  metrics-app
