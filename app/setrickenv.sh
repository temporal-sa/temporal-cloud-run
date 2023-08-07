#!/bin/bash

export TEMPORAL_NAMESPACE="rick-ross.a2dd6"
export TEMPORAL_ENDPOINT=rick-ross.a2dd6.tmprl.cloud:7233
export TEMPORAL_CLIENT_KEY="/Users/rickross/dev/samples-server/tls/client-only/mac/rick-ross.key"
export TEMPORAL_CLIENT_CERT="/Users/rickross/dev/samples-server/tls/client-only/mac/rick-ross.pem"
export TEMPORAL_INSECURE_TRUST_MANAGER="true"

# to export these to the calling shell use
# source ./ricksetenv.sh