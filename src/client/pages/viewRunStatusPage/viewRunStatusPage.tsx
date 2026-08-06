import { ErrorBoundary } from "blaise-design-system-react-components";
import { type ReactElement, useMemo } from "react";
import { useParams } from "react-router-dom";

import { batchToData } from "../../../shared/dataDeliveryParsers";
import { type DataDeliveryBatchData } from "../../../shared/types";
import { useLocationState } from "../../utils/useLocationState";

import BatchStatusList from "./sections/batchStatusList";
import Breadcrumbs from "./sections/breadcrumbs";

function ViewRunStatusPage(): ReactElement {
  const { batchName } = useParams<{ batchName: string }>();
  const locationState = useLocationState<{ batch: DataDeliveryBatchData }>();

  const batch = useMemo(() => {
    if (locationState?.batch) {
      return { batch: locationState.batch };
    }

    if (!batchName) {
      return { errorMessage: "Invalid batch name format: No batch name provided" };
    }

    try {
      return { batch: batchToData(batchName) };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return { errorMessage: `Invalid batch name format: ${errorMessage}` };
    }
  }, [batchName, locationState]);

  return (
    <>
      <Breadcrumbs />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        {"errorMessage" in batch ? (
          <div className="ons-u-mt-l">{batch.errorMessage}</div>
        ) : (
          <>
            <h1 className="ons-u-mb-l">
              Data delivery run for {batch.batch.survey} at {batch.batch.dateString}
            </h1>
            <ErrorBoundary errorMessageText="Failed to load batch file statuses.">
              <BatchStatusList batch={batch.batch} />
            </ErrorBoundary>
          </>
        )}
      </main>
    </>
  );
}

export default ViewRunStatusPage;
