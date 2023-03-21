import { getEnvironmentVariables } from "./config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const { PROJECT_ID, DDS_API_URL, AZURE_AUTH_TOKEN, ENV_NAME, GIT_BRANCH, DATA_DELIVERY_AZURE_PIPELINE_NO, DDS_CLIENT_ID } = getEnvironmentVariables();

        expect(PROJECT_ID).toBe("a-project-name");
        expect(DDS_API_URL).toBe("mock-api");
        expect(AZURE_AUTH_TOKEN).toBe("mock-auth");
        expect(ENV_NAME).toBe("mock-env");
        expect(GIT_BRANCH).toBe("mock-branch");
        expect(DATA_DELIVERY_AZURE_PIPELINE_NO).toBe("mock-pipeline-no");
        expect(DDS_CLIENT_ID).toBe("mock-client-id");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            AZURE_AUTH_TOKEN: undefined,
            ENV_NAME: undefined,
            GIT_BRANCH: undefined,
            DATA_DELIVERY_AZURE_PIPELINE_NO: undefined,
        });

        const { PROJECT_ID, DDS_API_URL, AZURE_AUTH_TOKEN, ENV_NAME, GIT_BRANCH, DATA_DELIVERY_AZURE_PIPELINE_NO, DDS_CLIENT_ID } = getEnvironmentVariables();

        expect(PROJECT_ID).toBe("ENV_VAR_NOT_SET");
        expect(DDS_API_URL).toBe("ENV_VAR_NOT_SET");
        expect(AZURE_AUTH_TOKEN).toBe("ENV_VAR_NOT_SET");
        expect(ENV_NAME).toBe("ENV_VAR_NOT_SET");
        expect(GIT_BRANCH).toBe("ENV_VAR_NOT_SET");
        expect(DATA_DELIVERY_AZURE_PIPELINE_NO).toBe("ENV_VAR_NOT_SET");
        expect(DDS_CLIENT_ID).toBe("ENV_VAR_NOT_SET");
    });
});
