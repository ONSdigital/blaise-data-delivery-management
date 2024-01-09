# Data Delivery Management

[![codecov](https://codecov.io/gh/ONSdigital/blaise-data-delivery-management/branch/main/graph/badge.svg)](https://codecov.io/gh/ONSdigital/blaise-data-delivery-management)
[![CI status](https://github.com/ONSdigital/blaise-data-delivery-management/workflows/Test%20coverage%20report/badge.svg)](https://github.com/ONSdigital/blaise-data-delivery-management/workflows/Test%20coverage%20report/badge.svg)
<img src="https://img.shields.io/github/release/ONSdigital/blaise-data-delivery-management.svg?style=flat-square" alt="Nisra Case Mover release verison">
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/ONSdigital/blaise-data-delivery-management.svg)](https://github.com/ONSdigital/blaise-data-delivery-management/pulls)
[![Github last commit](https://img.shields.io/github/last-commit/ONSdigital/blaise-data-delivery-management.svg)](https://github.com/ONSdigital/blaise-data-delivery-management/commits)
[![Github contributors](https://img.shields.io/github/contributors/ONSdigital/blaise-data-delivery-management.svg)](https://github.com/ONSdigital/blaise-data-delivery-management/graphs/contributors)

Service to see the status of data delivery files and manually trigger data delivery pipeline.

This project is a React application which when build is rendered by a Node.js express server.

### First time setup
---
To run Blaise Data Delivery Management locally, you'll need to have [Node installed](https://nodejs.org/en/), as well as [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable).

To have the list of instruments load on the page you can set the URL to the Data Delivery Status (DDS) service running in App Engine in a sandbox. Details for how to find this URL can be found in the .env table below.

Clone the repository:
```shell script
git clone https://github.com/ONSdigital/blaise-data-delivery-management.git
```

and install the project dependencies:
```shell script
yarn install
```

Running yarn or yarn install will install the required modules specified in the yarn.lock file.

The versions of these modules are fixed in the yarn.lock files, so to avoid unwanted upgrades or instability caused by incorrect modifications, DO NOT DELETE THE LOCK FILE.

More information about yarn (https://confluence.ons.gov.uk/x/zdwACQ)

Create a .env file in the root of the project and add the following variables:

| Variable | Description | Example |
|---------------------------------|---------------------------------------------------------------------------------|------------------------------|
| DDS_API_URL        | The URL the Data Delivery Status (DDS) service is running on to send calls to| `https://dev-<env>-ddstatus.social-surveys.gcp.onsdigital.uk` |
| DDS_CLIENT_ID                        | Client ID to authenticate with Data Delivery Status (DDS). To obtain: 1. navigate to the GCP console, search for IAP, click "Identity-Aware-Proxy", click the three dots on right of the data-delivery-status service and select OAuth. Client Id will be on the right.  | something.apps.googleusercontent.com | 
| GOOGLE_APPLICATION_CREDENTIALS                        | JSON service account key (see below for how to obtain)  | keys.json |

The .env file should be setup as below. **DO NOT COMMIT THIS FILE**
```.env
DDS_API_URL=https://dev-<env>-ddstatus.social-surveys.gcp.onsdigital.uk
DDS_CLIENT_ID=blah
GOOGLE_APPLICATION_CREDENTIALS=keys.json
```
### Google application credentials
---
To get the service working locally, you need
to [obtain a JSON service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys), this
will need to be a service account with create and list permissions. Save the service account key
as  `keys.json` and place in the root of the project. Providing the NODE_ENV is not production, then the GCP storage
config will attempt to use this file. **DO NOT COMMIT THIS FILE**


To create a keys.json file:
```shell
gcloud iam service-accounts keys create keys.json --iam-account ons-blaise-v2-dev-<sandbox>@appspot.gserviceaccount.com`
```

You can also export the Google application credentials as a runtime variable rather than including in the .env file above:
```shell
export GOOGLE_APPLICATION_CREDENTIALS=keys.json
```

If you get the following message:
```shell
unmet preconditions
```
Go to GCP > Select the dev project > IAM > Service Accounts. ons-blaise-v2-dev@appspot.gserviceaccount.com will likely have the max 10 keys.  Select the kebab menu on the right > Manage keys and delete a selection of the oldest keys, for example the oldest 3.

### Running locally
---
Run Node.js and React.js via the package.json script:
```shell script
yarn dev
```

The UI should now be accessible via:
http://localhost:3000/

### Executing tests
---
Tests can be run via the package.json script:
```shell script
yarn test
```

To prevent tests from printing messages through the console tests can be run silently via the package.json script:
```shell script
yarn test --silent
```

Test snapshots can be updated via:
```shell script
yarn test -u
```
