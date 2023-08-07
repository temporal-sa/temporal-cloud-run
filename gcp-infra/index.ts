import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import {createGCPProject} from "./gcpHelper";
import * as fs from 'fs';
import * as cmd from "@pulumi/command";

interface GcpConfig {
    projectId: string;
    projectName: string;
    region: string;
    zone: string;
    billingAccountId: string;
    organizationId: string;
    folderId: string;
    vpcName: string;
}

const config = new pulumi.Config("gcp");
const gcpProjectId = config.require("project");

const topLevelConfig = new pulumi.Config()

const gcpConfig = topLevelConfig.requireObject<GcpConfig>('gcp');
// stuff the orjectId into our configuration structure
gcpConfig.projectId = gcpProjectId;

interface TemporalCloudConfig {
    namespace: string;
    endpoint: string;
    insecureTrustManager: boolean;
    clientKeyFile: string;
    clientCertFile: string;
}

const temporalConfig = topLevelConfig.requireObject<TemporalCloudConfig>('temporal-cloud');

// make sure the files exist
if (!fs.existsSync(temporalConfig.clientKeyFile)) {
    pulumi.log.error("The clientKeyFile does not exist: " + temporalConfig.clientKeyFile);
    throw new Error("The file " + temporalConfig.clientKeyFile + ' does not exist. (keyfile)');
}

const clientKeyData = fs.readFileSync( temporalConfig.clientKeyFile );
if (clientKeyData == null || clientKeyData.length == 0) {
    pulumi.log.error("The clientKeyFile is empty " + temporalConfig.clientKeyFile);
    throw new Error("The file " + temporalConfig.clientKeyFile + ' is empty (keyfile)');
}

// make sure the files exist
if (!fs.existsSync(temporalConfig.clientCertFile)) {
    pulumi.log.error("The clientCertFile does not exist: " + temporalConfig.clientCertFile);
    throw new Error("The file " + temporalConfig.clientCertFile + ' does not exist. (certfile)');
}

const clientCertData = fs.readFileSync( temporalConfig.clientCertFile );
if (clientCertData == null || clientCertData.length == 0) {
    pulumi.log.error("The clientCertFile is empty " + temporalConfig.clientCertFile);
    throw new Error("The file " + temporalConfig.clientCertFile + ' is empty (certfile)');
}

// Create or reference a GCP project
var myProject = createGCPProject(gcpConfig.organizationId,
    gcpConfig.folderId,
    gcpConfig.projectName,
    gcpConfig.projectId,
    gcpConfig.billingAccountId);

// enable APIs
const computeEngineApi = new gcp.projects.Service("compute-api", {
    disableDependentServices: true,
    service: "compute.googleapis.com",
    project: myProject.projectId,
})

const cloudRunApi = new gcp.projects.Service("cloud-run-api", {
   disableDependentServices: true,
   service: "run.googleapis.com",
   project: myProject.projectId,
});

const cloudBuildApi = new gcp.projects.Service("cloud-build-api", {
   disableDependentServices: true,
   service: "cloudbuild.googleapis.com",
   project: myProject.projectId,
});

const artifactRegistryApi = new gcp.projects.Service("artfiact-registry-api", {
   disableDependentServices: true,
   service: "artifactregistry.googleapis.com",
   project: myProject.projectId,
},{
    dependsOn: [ myProject ],
});

const monitoringApi = new gcp.projects.Service("monitoring-api",{
    disableDependentServices: true,
    service: "monitoring.googleapis.com",
    project: myProject.projectId,
});

const secretManagerApi = new gcp.projects.Service("secrets-mgr-api", {
   disableDependentServices: true,
   service: "secretmanager.googleapis.com",
   project: myProject.projectId,
});

// create a network and have the subnets automatically created
const network = new gcp.compute.Network(gcpConfig.vpcName, {
    autoCreateSubnetworks: true,
    project: myProject.projectId,
}, {
    dependsOn: [computeEngineApi],
});

const firewallRule = new gcp.compute.Firewall("default-allow-ping-http-ssh",{
    network: network.selfLink,
    allows: [
        {
            protocol: 'icmp', // PING
        },
        {
            protocol: 'tcp',
            ports: ["80","443"] // HTTP and HTTPS
        },
        {
            protocol: 'tcp',
            ports: ["22"], // SSH
        }
    ],
    sourceTags: ["default-fw-rule"],
    project: myProject.projectId,
});

// create a service account for cloud run
const cloudRunServiceAccount = new gcp.serviceaccount.Account("tmprl-cr-svc-account", {
   project: myProject.projectId,
   accountId: "tmprl-cr-service-account",
   displayName: "temporal-cloudrun-service-account",
});

// add the correct roles
const svcAccountUser = new gcp.projects.IAMMember("cr-svc-acct-member-svc-acct-user", {
   project: myProject.projectId,
   role: "roles/iam.serviceAccountUser",
   member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

const svcAccountViewer = new gcp.projects.IAMMember("cr-svc-acct-member-obj-viewer", {
    project: myProject.projectId,
    role: "roles/storage.objectViewer",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

const svcAccountLogWriter = new gcp.projects.IAMMember("cr-svc-acct-member-log-writer", {
    project: myProject.projectId,
    role: "roles/logging.logWriter",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

const svcAccountArtifactCreateOrPush = new gcp.projects.IAMMember("cr-svc-acct-member-artifact-create-push", {
    project: myProject.projectId,
    role: "roles/artifactregistry.createOnPushWriter",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

const svcAccountCloudRunAdmin = new gcp.projects.IAMMember("cr-svc-acct-member-cr-admin", {
    project: myProject.projectId,
    role: "roles/run.admin",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

// we need to be able to access secrets to get certs to connect to Temporal
const svcAccountSecretManagerAccessor = new gcp.projects.IAMMember("cr-svc-acct-secret-mgr-accessor", {
   project: myProject.projectId,
   role: "roles/secretmanager.secretAccessor",
   member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
});

// create an artifact registry
const artifactRegistry = new gcp.artifactregistry.Repository("artifact-repo", {
   description: "Demo Docker repository",
   dockerConfig: {
       immutableTags: false,
    },
   format: "DOCKER",
   location: gcpConfig.region,
   repositoryId: "demo-repository",
}, {
    dependsOn: [myProject, artifactRegistryApi, svcAccountArtifactCreateOrPush],
});

// create secrets for the certifications
const clientKeySecret = new gcp.secretmanager.Secret("clientKey", {
    project: myProject.projectId,
    labels: {
        purpose: "temporal-cloud",
        clienttype: "key",
    },
    replication: {
        automatic: true,
    },
    secretId: "clientKey",
},{
    dependsOn: [secretManagerApi],
});

// store the clientKey
const clientKeySecretVersion = new gcp.secretmanager.SecretVersion("clientKeySecretVersion", {
   secret: clientKeySecret.id,
   secretData: clientKeyData.toString(),
}, {
    dependsOn: [clientKeySecret],
});

const certSecret = new gcp.secretmanager.Secret("cert-secret", {
   project: myProject.projectId,
   labels: {
       purpose: "temporal-cloud",
       clienttype: "cert",
   },
    replication: {
       automatic: true,
    },
    secretId: "clientCert"
},{
    dependsOn: [secretManagerApi],
});

// store the clientCert
const clientCertSecretVersion = new gcp.secretmanager.SecretVersion("clientCertSecretVersion", {
   secret: certSecret.id,
   secretData: clientCertData.toString(),
},{
    dependsOn: [certSecret],
});

export const serviceAccountEmail = cloudRunServiceAccount.email;
export const serviceAccountFullName = cloudRunServiceAccount.name;
export const serviceAccountShortName = cloudRunServiceAccount.accountId;

// create a service account for cloud build
const cloudBuildServiceAccount = new gcp.serviceaccount.Account("tmprl-cloud-bld-svc-account", {
    project: myProject.projectId,
    accountId: "tmprl-cb-service-account",
    displayName: "temporal-cloud-build-service-account",
});

// add the correct roles for Cloud Build
const svcAccountUserCloudBuild = new gcp.projects.IAMMember("cb-svc-acct-member-svc-acct-user", {
    project: myProject.projectId,
    role: "roles/iam.serviceAccountUser",
    member: pulumi.interpolate`serviceAccount:${cloudBuildServiceAccount.email}`,
});

const svcAccountObjViewerCloudBuild = new gcp.projects.IAMMember("cb-svc-acct-member-obj-viewer",{
    project: myProject.projectId,
    role: "roles/storage.objectViewer",
    member: pulumi.interpolate`serviceAccount:${cloudBuildServiceAccount.email}`,
});

const svcAccountLoggingCloudBuild = new gcp.projects.IAMMember("cb-svc-acct-member-log-writer",{
    project: myProject.projectId,
    role: "roles/logging.logWriter",
    member: pulumi.interpolate`serviceAccount:${cloudBuildServiceAccount.email}`,
});

const svcAccountArtifactRegistruPushCloudBuild = new gcp.projects.IAMMember("cb-svc-acct-member-art-reg-create",{
    project: myProject.projectId,
    role: "roles/artifactregistry.createOnPushWriter",
    member: pulumi.interpolate`serviceAccount:${cloudBuildServiceAccount.email}`,
});

const svcAccountCloudRunAdminCloudBuild = new gcp.projects.IAMMember("cb-svc-acct-member-cr-admin",{
    project: myProject.projectId,
    role: "roles/run.admin",
    member: pulumi.interpolate`serviceAccount:${cloudBuildServiceAccount.email}`,
});

export const runCloudBuild =  pulumi.interpolate`cd ..; gcloud config set project ${myProject.projectId}; gcloud builds submit . --substitutions=_REGION=${gcpConfig.region},_REPOSITORY_NAME=${artifactRegistry.repositoryId},_SA_NAME=${cloudRunServiceAccount.accountId},_SA_EMAIL=${cloudRunServiceAccount.email},_TEMPORAL_NAMESPACE=${temporalConfig.namespace},_TEMPORAL_ENDPOINT=${temporalConfig.endpoint},_TEMPORAL_INSECURE_TRUST_MANAGER=${String(temporalConfig.insecureTrustManager)}`;
export const cloudRunSvcAccountEmail = cloudRunServiceAccount.email;