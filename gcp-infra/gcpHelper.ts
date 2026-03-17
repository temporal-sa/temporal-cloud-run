import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createGCPProject(
    organizationId : string,
    folderId : string,
    projectName : string,
    projectId : string,
    billingAccountId : string) : any {

    let myProject;
    pulumi.log.info(`folderId is ${folderId}`)
    pulumi.log.info(`organizationId is ${organizationId}`)
    pulumi.log.info(`projectName is ${projectName}`)
    pulumi.log.info(`projectId is ${projectId}`)
    pulumi.log.info(`billingAccountId is ${billingAccountId}`)
    if (folderId) {
        pulumi.log.info("Creating a GCP project using the folder ID");
        myProject = new gcp.organizations.Project(projectName, {
            "projectId": projectId,
            "folderId": folderId,
            "billingAccount": billingAccountId,
        });
    } else {
        if (organizationId) {
            pulumi.log.info("Creating a GCP project using the organization ID");
            myProject = new gcp.organizations.Project(projectName, {
                "projectId": projectId,
                "orgId" : organizationId,
                "billingAccount": billingAccountId,
            });
        } else {
            pulumi.log.error(`Missing either an organization ID ${organizationId} or folder ID ${folderId}!`)
            throw new Error("Missing either an organization ID or folder ID")
        }
    }

    return myProject;
}