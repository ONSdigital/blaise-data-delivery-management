export interface EnvironmentVariables {
    PROJECT_ID: string
    DDS_API_URL: string
    AZURE_AUTH_TOKEN: string
    ENV_NAME: string
    GIT_BRANCH: string
    DATA_DELIVERY_AZURE_PIPELINE_NO: string
    DDS_CLIENT_ID: string
}

export function getEnvironmentVariables(): EnvironmentVariables {
    let { PROJECT_ID, DDS_API_URL, AZURE_AUTH_TOKEN, ENV_NAME, GIT_BRANCH, DATA_DELIVERY_AZURE_PIPELINE_NO, DDS_CLIENT_ID } = process.env;

    if (PROJECT_ID === undefined) {
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (DDS_API_URL === undefined) {
        console.error("DDS_API_URL environment variable has not been set");
        DDS_API_URL = "ENV_VAR_NOT_SET";
    }

    if (AZURE_AUTH_TOKEN === undefined) {
        AZURE_AUTH_TOKEN = "ENV_VAR_NOT_SET";
    }

    if (ENV_NAME === undefined) {
        ENV_NAME = "ENV_VAR_NOT_SET";
    }

    if (GIT_BRANCH === undefined) {
        GIT_BRANCH = "ENV_VAR_NOT_SET";
    }

    if (DATA_DELIVERY_AZURE_PIPELINE_NO === undefined) {
        DATA_DELIVERY_AZURE_PIPELINE_NO = "ENV_VAR_NOT_SET";
    }

    if (DDS_CLIENT_ID === undefined) {
        console.error("DATA_DELIVERY_DDS_CLIENT_ID environment variable has not been set");
        DDS_CLIENT_ID = "ENV_VAR_NOT_SET";
    }

    return { PROJECT_ID, DDS_API_URL, AZURE_AUTH_TOKEN, ENV_NAME, GIT_BRANCH, DATA_DELIVERY_AZURE_PIPELINE_NO, DDS_CLIENT_ID };
}
