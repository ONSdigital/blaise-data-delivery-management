import React, { ReactElement, useEffect, useState } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import {
    Footer,
    Header,
    ONSPanel,
    DefaultErrorBoundary,
    ErrorBoundary,
} from "blaise-design-system-react-components";
import Confirmation from "./Components/Confirmation";
import BatchesList from "./Components/BatchesList";
import BatchStatusList from "./Components/BatchStatusList";
import { getBatchStatusDescriptions } from "./utilities/http";
import "./style.css";

const divStyle = {
    minHeight: "calc(67vh)"
};

interface Location {
    state: { status: string }
}

type BatchDescription = { [key: string]: string }

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
                    <Switch>
                        <Route path="/trigger">
                            <Confirmation />
                        </Route>
                        <Route path="/batch">
                            <BatchStatusList statusDescriptionList={statusDescriptionList} />
                        </Route>
                        <Route path="/">

                            {
                                status !== "" &&
                                <ONSPanel status={status?.includes("success") ? "success" : "error"}>
                                    <p>{status}</p>
                                </ONSPanel>
                            }

                            <main id="main-content" className="ons-page__main ons-u-mt-no">

                                {/*<ul className="list list--bare list--inline u-mt-m">*/}
                                {/*    <li className="list__item">*/}
                                {/*        <Link to="/trigger" id="audit-logs-link">*/}
                                {/*            Trigger Data Delivery*/}
                                {/*        </Link>*/}
                                {/*    </li>*/}
                                {/*</ul>*/}

                                <h1 className="ons-u-mt-m">Data delivery runs</h1>
                                <ErrorBoundary errorMessageText={"Unable to load batch list table correctly"}>
                                    <BatchesList />
                                </ErrorBoundary>
                            </main>
                        </Route>
                    </Switch>
                </DefaultErrorBoundary>
            </div>
            <Footer />
        </>
    );
}

export default App;
