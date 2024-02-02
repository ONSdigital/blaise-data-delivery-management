process.env = Object.assign(process.env, {
    PROJECT_ID: "a-project-name",
    AZURE_AUTH_TOKEN: "mock-auth",
    ENV_NAME: "mock-env",
    GIT_BRANCH: "mock-branch",
    DATA_DELIVERY_AZURE_PIPELINE_NO: "mock-pipeline-no",
    DDS_API_URL: "mock-api",
    DDS_CLIENT_ID: "mock-client-id"
});

module.exports = {
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "\\.(jpg)$": "identity-obj-proxy"
    },
    transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],
    testTimeout: 20000
};
