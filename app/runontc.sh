#!/bin/bash

# be sure to set the TEMPORAL_NAMESPACE environment variable
if [ -z "${TEMPORAL_NAMESPACE}" ]
then
  echo "Please set the TEMPORAL_NAMESPACE environment variable and re-run the script."
  exit 1
fi

if [ -z "${TEMPORAL_ENDPOINT}" ]
then
  echo "Please set the TEMPORAL_ENDPOINT environment variable and re-run the script."
  exit 2
fi

if [ -z "${TEMPORAL_CLIENT_KEY}" ]
then
  echo "Please set the TEMPORAL_CLIENT_KEY environment variable and re-run the script."
  exit 3
fi

if [ -z "${TEMPORAL_CLIENT_CERT}" ]
then
  echo "Please set the TEMPORAL_CLIENT_CERT environment variable and re-run the script."
  exit 4
fi

if [ -z "${TEMPORAL_INSECURE_TRUST_MANAGER}" ]
then
  echo "Warning. TEMPORAL_INSECURE_TRUST_MANAGER environment variable was not set. Defaulting to false."
  export $TEMPORAL_INSECURE_TRUST_MANAGER=false
fi

# Use Temporal Cloud spring profile
export SPRING_PROFILE="tc"
export APP_COMMANDS="-Dspring.temporal.namespace=$TEMPORAL_NAMESPACE -Dspring.temporal.connection.target=$TEMPORAL_ENDPOINT -Dspring.temporal.connection.mtls.insecure-trust-manager=$TEMPORAL_INSECURE_TRUST_MANAGER -Dspring.temporal.connection.mtls.key-file=/keyfile.key -Dspring.temporal.connection.mtls.cert-chain-file=/cert.pem"

# echo "$APP_COMMANDS"
docker run \
  --publish 3030:8080 \
  --publish 3031:8081 \
  --mount type=bind,source=$TEMPORAL_CLIENT_KEY,target=/keyfile.key,readonly \
  --mount type=bind,source=$TEMPORAL_CLIENT_CERT,target=/cert.pem,readonly \
  --env SPRING_PROFILE="$SPRING_PROFILE" \
  --env APP_COMMANDS="$APP_COMMANDS" \
  metrics-app

