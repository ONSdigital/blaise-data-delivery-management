# Blaise Data Delivery Management (DDM)

Data Delivery Management provides a web UI for viewing the status of data deliveries.

The app is a React frontend served by an Express backend. API calls to Data Delivery Status (DDS) are authenticated using Google Application Default Credentials (ADC).

## Data delivery trigger availability

The ability to trigger data delivery runs from the UI is temporarily disabled to prevent abuse.

The backend code path for triggering runs is still present in the codebase, and the related environment variables are still configured for deployments.

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Yarn Classic](https://classic.yarnpkg.com/en/docs/install) 1.x (this repo uses `yarn@1.22.22`)
- [Google Cloud SDK (`gcloud` CLI)](https://cloud.google.com/sdk/)

### Clone and install packages

```shell
git clone https://github.com/ONSdigital/blaise-data-delivery-management.git
cd blaise-data-delivery-management
yarn install
```

### Authenticate with Google Cloud (keyless)

```shell
gcloud auth login
gcloud config set project ons-blaise-v2-dev-<sandbox>
gcloud auth application-default login --impersonate-service-account=ons-blaise-v2-dev-<sandbox>@appspot.gserviceaccount.com
```

### Configure environment variables

Create a `.env` file in the repository root.

Note: environment variables used for triggering data delivery runs are not required for local setup, because this functionality is not currently available via the UI.

You can find the DDS IAP client ID from an existing App Engine deployment via the GCP console:

- App Engine -> Versions -> `ddm-ui` -> View Config

Example `.env` file:

```ini
DDS_API_URL=https://dev-<sandbox>-dds.social-surveys.gcp.onsdigital.uk
DDS_CLIENT_ID=blah.apps.googleusercontent.com
```

### Run the app

```shell
yarn dev
```

The UI should be available at: http://localhost:3000/
