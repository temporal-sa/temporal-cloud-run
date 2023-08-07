# Temporal Sample Metrics Application

This is a simple application has a single workflow that takes an input and runs 
two activities. The activities fail, causing some retries and then continue along
successfully. This is so that the application has some non-zero SDK metrics.

The application uses Spring Boot to do a lot of auto-magic wiring up of components. 
It uses [temporal-spring-boot-autoconfigurator-alpha](https://github.com/temporalio/sdk-java/tree/master/temporal-spring-boot-autoconfigure-alpha)
to auto-configure temporal specific details. 

Once the application is up and running, you can access a web page that provides a simple 
HTML client to start the workflow. 

To start a local Temporal Server:

```shell
temporal server start-dev
```

To run this locally, without creating a container:

```shell
./gradlew bootRun
```

You can access the application using [http://localhost:8080](http://localhost:8080/). 
Temmporal SDK Metric end point is located at  [http://localhost:8081/prometheus](http://localhost:8081/prometheus). 

To run this within a Docker container, first build the Docker iamge with the following command:

```shell
./buildcontainer.sh
```

Running the application using your local Temporal Server first set the namespace environment variable:

```shell
export TEMPORAL_NAMESPACE=default # change if necessary
```

Now launch the container with the following command:

```shell
./runlocal.sh 
```

You might need to modify runlocal.sh if you are not using the default namespace.
You can access the application using [http://localhost:3030](http://localhost:3030/).
Temmporal SDK Metric end point is located at  [http://localhost:3031/prometheus](http://localhost:3031/prometheus). 

To run this in Temporal Cloud, you need to first configure your namespace with your MTLs certificates. 
More information can be found [here](https://docs.temporal.io/cloud/how-to-manage-certificates-in-temporal-cloud). 
You can also use tcld command line to generate and upload your certificates. 
[This blog post](https://temporal.io/blog/certificate-generation-for-temporal-cloud-with-tcld) is a great tutorial to walk through.

To run this within a Docker container, using Temporal Cloud, set the following environment variables:

```shell
export TEMPORAL_ENDPOINT=<NAMESPACE>.tmprl.cloud:7233
export TEMPORAL_NAMESPACE=<NAMESPACE>
export TEMPORAL_CLIENT_KEY="/path/to/your.key"
export TEMPORAL_CLIENT_CERT="/path/to/your/cert.pem"
```

If you are using self-signed certificates, you can either add your certificate authority public key (.pem) to java default truststore or 
 set the following environment variable: 

```shell
export TEMPORAL_INSECURE_TRUST_MANAGER="true"
```

Once the environment variables are set, run the docker image:

```shell
./runontc.sh
```

You can access the application using [http://localhost:3030](http://localhost:3030/).
Temmporal SDK Metric end point is located at  [http://localhost:3031/prometheus](http://localhost:3031/prometheus). 
