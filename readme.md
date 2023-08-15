# Temporal on Cloud Run

This repository demonstrates how to run workers on [GCP's Cloud Run](https://cloud.google.com/run). 
Cloud Run is a serverless offering making it easier to deploy and run containerized applications. 
Initially Cloud Run was only for web based applications that responds to requests. Over time Cloud Run
has added the ability to run jobs as well. 

As awesome as Cloud Run is, there are some challenges that need to be addressed for applications that 
act as Temporal workers. One challenge is that Cloud Run is designed to run when requests are made, 
which provides a nice pay per use model. Unfortunately this doesn't play well with workers which long 
poll Temporal, waiting for work to process. 

The workaround for this is to disable [CPU Throttling](https://cloud.google.com/run/docs/configuring/cpu-allocation#setting). In YAML this looks like this:

```yaml
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: 'false'  # we need to keep the CPU running
```

Another challenge is that by default, an application running Cloud Run is scaled down to zero instances 
if there are no inbound web requests. This too, doesn't play well with Temporal workers.

The workaround for this is to set the [minimum number of instances](https://cloud.google.com/run/docs/configuring/min-instances#setting):

```yaml
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1' # keep one instance available
```

Cloud Run only allows one port to be publicly exposed and exposing a Temporal SDK Metrics 
endpoint externally is not a good idea. Deploy the [Open Telemetry Connector](https://cloud.google.com/run/docs/tutorials/custom-metrics-opentelemetry-sidecar) in a 
[sidecar container](https://cloud.google.com/blog/products/serverless/cloud-run-now-supports-multi-container-deployments). 
The Open Telemetry Collector reads the Temporal SDK Metrics Prometheus scrape endpoint and can push 
the metrics (and optionally tracing and logging) to a destination of your choice. 

In this example, I chose to send the metrics to [Google Cloud Managed Prometheus](https://cloud.google.com/managed-prometheus).
The collector supports a wide range of other [exporters](https://opentelemetry.io/ecosystem/registry/?component=exporter) 
including Prometheus Remote Write Collector, Datadog, Splunk, Google Cloud Pubsub, Google Cloud Operations Collector. 
The full list of exporters are available [here](https://opentelemetry.io/ecosystem/registry/?component=exporter).