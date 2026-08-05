service: ddm-ui
runtime: nodejs24

vpc_access_connector:
  name: _VPC_CONNECTOR

env_variables:
  PROJECT_ID: _PROJECT_ID
  DDS_API_URL: _DDS_API_URL
  DDS_CLIENT_ID: _DDS_CLIENT_ID

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
