import React, { type ReactElement, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
    DefaultErrorBoundary,
    Footer,
    Header,
} from "blaise-design-system-react-components";
import DataDeliveryRunsPage from "./pages/dataDeliveryRunsPage/dataDeliveryRunsPage";
import TriggerDataDeliveryPage from "./pages/triggerDataDeliveryPage/triggerDataDeliveryPage";
import ViewRunStatusPage from "./pages/viewRunStatusPage/viewRunStatusPage";
import { getBatchStatusDescriptions } from "./api";

const divStyle = {
    minHeight: "calc(67vh)"
};

interface Location {
    state: { status: string }
}

type BatchDescription = { [key: string]: string };

function App(): ReactElement {

    const location = useLocation();
    const { status } = (location as Location).state || { status: "" };
    const [statusDescriptionList, setStatusDescriptionList] = useState<BatchDescription>({});

    useEffect(() => {
        callGetBatchStatusDescriptions().then(() => console.log("getBatchStatusDescriptions Complete"));
    }, []);

    async function callGetBatchStatusDescriptions() {
        setStatusDescriptionList({});

        const [success, statusDescriptionList] = await getBatchStatusDescriptions();

        if (!success) {
            return;
        }

        setStatusDescriptionList(statusDescriptionList as BatchDescription);
    }

    return (
        <>
            <Header title={"Data Delivery Management"} />
            <div style={divStyle} className="ons-page__container ons-container">
                <DefaultErrorBoundary>
                    <Routes>
                        <Route path="/trigger" element={<TriggerDataDeliveryPage />} />
                        <Route
                            path="/batch"
                            element={
                                <DataDeliveryRunsPage status={status} />
                            }
                        />
                        <Route
                            path="/batch/:batchName"
                            element={
                                <ViewRunStatusPage statusDescriptionList={statusDescriptionList} />
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <DataDeliveryRunsPage status={status} />
                            }
                        />
                    </Routes>
                </DefaultErrorBoundary>
            </div>
            <Footer />
        </>
    );
}

export default App;
