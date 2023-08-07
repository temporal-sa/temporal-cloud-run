import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createGCPProject(
    organizationId : string,
    folderId : string,
    projectName : string,
    projectId : string,
    billingAccountId : string) : any {

    let myProject;
    if (folderId != null && folderId.length > 0) {
        pulumi.log.info("Creating a GCP project using the folder ID");
        myProject = new gcp.organizations.Project(projectName, {
            "projectId": projectId,
            "folderId": folderId,
            "billingAccount": billingAccountId,
        });
    } else {
        if (organizationId != null && organizationId.length > 0) {
            pulumi.log.info("Creating a GCP project using the organization ID");
            myProject = new gcp.organizations.Project(projectName, {
                "projectId": projectId,
                "orgId" : organizationId,
                "billingAccount": billingAccountId,
            });
        } else {
            pulumi.log.error("Missing either an organization ID or folder ID!");
            throw new Error("Missing either an organization ID or folder ID");
        }
    }

    return myProject;
}