service: ddm-ui
runtime: nodejs18

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

automatic_scaling:
  min_instances: _MAX_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
