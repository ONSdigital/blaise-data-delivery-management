import React, { type ReactElement } from "react";
import { ErrorBoundary } from "blaise-design-system-react-components";
import BatchesList from "./batchesList";

function DataDeliveryRuns(): ReactElement {
    return (
        <ErrorBoundary errorMessageText="Unable to load batch list table correctly">
            <BatchesList />
        </ErrorBoundary>
    );
}

export default DataDeliveryRuns;
