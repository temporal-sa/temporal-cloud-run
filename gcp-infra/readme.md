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


