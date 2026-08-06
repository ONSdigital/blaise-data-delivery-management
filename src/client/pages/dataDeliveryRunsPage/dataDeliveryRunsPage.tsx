import { ErrorBoundary } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import BatchesList from "./sections/batchesList";
import StatusMessage from "./sections/statusMessage";

type Props = {
  status: string;
};

function DataDeliveryRunsPage({ status }: Props): ReactElement {
  return (
    <>
      <StatusMessage status={status} />
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <h1 className="ons-u-mt-m">Data delivery runs</h1>
        <ErrorBoundary errorMessageText="Unable to load batch list table correctly">
          <BatchesList />
        </ErrorBoundary>
      </main>
    </>
  );
}

export default DataDeliveryRunsPage;
