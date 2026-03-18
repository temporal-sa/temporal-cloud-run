# Temporal Sample Metrics Application

This is a simple application has a single workflow that takes an input and runs
two activities. The activities fail, causing some retries and then continue along
successfully. This is so that the application has some non-zero SDK metrics.

The application uses Spring Boot to do a lot of auto-magic wiring up of components.
It uses [temporal-spring-boot-autoconfigurator](https://github.com/temporalio/sdk-java/tree/master/temporal-spring-boot-autoconfigure)
to auto-configure temporal specific details.

Once the application is up and running, you can access a web page that provides a simple
HTML client to start the workflow.

See the main readme.md for more information on how to view on Cloud Run