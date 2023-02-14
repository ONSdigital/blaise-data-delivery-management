service: ddm-ui
runtime: nodejs16

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  PROJECT_ID: _PROJECT_ID
  DDS_API_URL: _DDS_API_URL
  AZURE_AUTH_TOKEN: _AZURE_AUTH_TOKEN
  ENV_NAME: _ENV_NAME
  GIT_BRANCH: _GIT_BRANCH
  DATA_DELIVERY_AZURE_PIPELINE_NO: _DATA_DELIVERY_AZURE_PIPELINE_NO
  DDS_CLIENT_ID: _DDS_CLIENT_ID

basic_scaling:
  idle_timeout: 1m
  max_instances: 1

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
