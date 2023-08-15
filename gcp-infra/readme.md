# Create a new GCP Project for the demo

Prerequisites
* [pulumi](https://www.pulumi.com/docs/install/)

Clone this repository and run pulumi up.

```shell
git clone https://
cd /path/to/repo/cloud-run/gcp-infra
npm install
pulumi up
```

Pulumi will prompt you to either choose a stack or enter a new one. 
Enter a new stack name, something like dev. 

Pulumi will complain that there is a missing configuration variable.

```shell
cp Pulumi.example.yaml Pulumi.<stack name>.yaml
```
Copy the example yaml file to your newly created stack name.

Now edit the file and enter the appropriate values. 

You need to specify either a _folderId_ or an _organizationId_. 
If both are specified, the folderId is used.

Also, be sure you specify your GCP Billing ID as this project uses resources 
that are not part of the free tier.  

When you are satisfied you have entered the correct values, re-run pulumi:

```shell
pulumi up
```

Answer yes if you are ready to create a new GCP project. Assuming there are
no errors, pulumi will create the necessary infrastructure for you.

When completed, Pulumi will display outputs, similar to this:

```text
Outputs:
    cloudRunSvcAccountEmail: "tmprl-cr-service-account@sa-temporal-cr.iam.gserviceaccount.com"
    runCloudBuild          : "cd ..; gcloud config set project sa-temporal-cr; gcloud builds submit . --substitutions=_REGION=us-east1,_REPOSITORY_NAME=demo-repository,_SA_NAME=tmprl-cr-service-account,_SA_EMAIL=tmprl-cr-service-account@sa-temporal-cr.iam.gserviceaccount.com,_TEMPORAL_NAMESPACE=rick-ross.a2dd6,_TEMPORAL_ENDPOINT=rick-ross.a2dd6.tmprl.cloud:7233,_TEMPORAL_INSECURE_TRUST_MANAGER=true"
    serviceAccountEmail    : "tmprl-cr-service-account@sa-temporal-cr.iam.gserviceaccount.com"
    serviceAccountFullName : "projects/sa-temporal-cr/serviceAccounts/tmprl-cr-service-account@sa-temporal-cr.iam.gserviceaccount.com"
    serviceAccountShortName: "tmprl-cr-service-account"
```

The runCloudBuild output contains a script that submits a Cloud Build job to build the application 
and the Open Telemetry Collector and deploy them into Cloud Run. To see just the output of the runCloudBuild variable
run the follwoing command:

```shell
pulumi stack output runCloudBuild
```

Take this output and paste it into your terminal or shell and hit enter. This kicks off the Cloud Build 
job and will take a bit of time to provision the infrastructure. 

If you want to see the outputs again you can run the following command:

```shell
pulumi stack output
```


