import React, { ReactElement, useEffect, useState } from "react";
import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getBatchInfo } from "../utilities/http";
import { DataDeliveryBatchData, DataDeliveryFileStatus } from "../../Interfaces";
import dateFormatter from "dayjs";
import { useLocation } from "react-router-dom";
import { getDDFileStatusStyle } from "../utilities/BatchStatusColour";
import { batch_to_data } from "../Functions";
import Breadcrumbs from "./Breadcrumbs";

interface Location {
    state: { batch: DataDeliveryBatchData }
}

interface Props {
    statusDescriptionList: { [key: string]: string }
}

function BatchStatusList({ statusDescriptionList }: Props): ReactElement {
    const [batchList, setBatchList] = useState<DataDeliveryFileStatus[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [loading, setLoading] = useState<boolean>(true);

    const location = useLocation();

    const { batch } = (location as Location).state || { batch: batch_to_data(location.pathname.split("/")[2]) };

    useEffect(() => {
        callGetBatchList().then(() => console.log("callGetBatchList Complete"));
    }, []);

    async function callGetBatchList() {
        setBatchList([]);
        setLoading(true);

        const [success, batchList] = await getBatchInfo(batch.name) as [boolean, DataDeliveryFileStatus[]];

        setLoading(false);

        if (!success) {
            setListError("Unable to load batch info");
            return;
        }

        if (batchList) {
            if (batchList.length === 0) {
                setListError("No data delivery files for this run found.");
            }

            batchList.sort((a: DataDeliveryFileStatus, b: DataDeliveryFileStatus) => new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf());
            setBatchList(batchList);
        }

    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Delivery trigger <em>{batch.survey} {batch.dateString}</em></h1>
                {
                    loading ?
                        <ONSLoadingPanel />
                        :
                        <div className={"elementToFadeIn"}>
                            <ONSButton onClick={() => callGetBatchList()} label="Reload" primary={true} small={true} />
                            <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                                {
                                    batchList && batchList.length > 0
                                        ?
                                        <table id="batch-table" className="ons-table ">
                                            <thead className="ons-table__head u-mt-m">
                                                <tr className="ons-table__row">
                                                    <th scope="col" className="ons-table__header ">
                                                        <span>Questionnaire</span>
                                                    </th>
                                                    <th scope="col" className="ons-table__header ">
                                                        <span>Status</span>
                                                    </th>
                                                    <th scope="col" className="ons-table__header ">
                                                        <span>Last update</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="ons-table__body">
                                                {
                                                    batchList.map(({
                                                        dd_filename,
                                                        state,
                                                        updated_at,
                                                        instrumentName,
                                                        error_info
                                                    }: DataDeliveryFileStatus) => {
                                                        return (
                                                            <tr className="ons-table__row" key={dd_filename}
                                                                data-testid={"batch-table-row"}>

                                                                <td className="ons-table__cell ">
                                                                    {instrumentName}
                                                                </td>
                                                                <td className="ons-table__cell ">
                                                                    <span className={`ons-status ons-status--${getDDFileStatusStyle(state, error_info)}`}
                                                                        data-testid={`${instrumentName}-status--${getDDFileStatusStyle(state, error_info)}`}
                                                                    >
                                                                        {
                                                                            (error_info === null || error_info === undefined || error_info === "" ?
                                                                                statusDescriptionList[state]
                                                                                :
                                                                                error_info
                                                                            )
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="ons-table__cell ">
                                                                    {dateFormatter(updated_at).format("DD/MM/YYYY HH:mm:ss")}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                        :
                                        <ONSPanel>{listError}</ONSPanel>
                                }
                            </ErrorBoundary>
                        </div>
                }
            </main>
        </>
    );
}

export default BatchStatusList;
