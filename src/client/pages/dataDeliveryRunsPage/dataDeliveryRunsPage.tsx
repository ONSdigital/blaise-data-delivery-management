import React, { type ReactElement } from "react";
import StatusMessage from "./sections/statusMessage";
import DataDeliveryRuns from "./sections/dataDeliveryRuns";

type Props = {
    status: string;
};

function DataDeliveryRunsPage({ status }: Props): ReactElement {
    return (
        <>
            <StatusMessage status={status} />
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mt-m">Data delivery runs</h1>
                <DataDeliveryRuns />
            </main>
        </>
    );
}

export default DataDeliveryRunsPage;
