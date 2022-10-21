import React, {ReactElement, useEffect, useState} from "react";
import {ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getAllBatches} from "../utilities/http";
import {DataDeliveryBatchData} from "../../Interfaces";
import {Link} from "react-router-dom";
import TimeAgo from "react-timeago";

import { DataDeliveryFileStatus } from "../../Interfaces";
import { getBatchInfo } from "../utilities/http";
import { getDDFileStatusStyle } from "../utilities/BatchStatusColour";

function determineOverallStatus(batchEntryStatuses: string[]) {
    const redAlerts: boolean = batchEntryStatuses.includes("error");
    const greyAlerts: boolean = batchEntryStatuses.includes("dead");
    const amberAlerts: boolean = batchEntryStatuses.includes("pending");
    
    if (redAlerts) {
        return "error";
    }
    else if (greyAlerts) {
        return "dead";
    }
    else if (amberAlerts) {
        return "pending";
    }
    else {
        return "success";
    }
}

function BatchesList(): ReactElement {
    const [batchList, setBatchList] = useState<DataDeliveryBatchData[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        callGetBatchList().then(() => console.log("callGetBatchList Complete"));
    }, []);

    async function callGetBatchList() {
        setBatchList([]);
        setLoading(true);

        const [success, batchListResponse] = await getAllBatches();
        setLoading(false);

        if (!success) {
            setListError("Unable to load data delivery run list");
            return;
        }

        if (batchListResponse.length === 0) {
            setListError("No data delivery runs found.");
        }

        batchListResponse.sort((a: DataDeliveryBatchData, b: DataDeliveryBatchData) => new Date(b.date).valueOf() - new Date(a.date).valueOf());

        const batchListPromises = batchListResponse.slice(0, 10).map(async (batch: DataDeliveryBatchData) => {
            const [success, batchInfoList] = await getBatchInfo(batch.name);

            if (!success) {
                return {
                    ...batch,
                    status: "dead"
                };
            };

            const batchEntryStatuses: string[] = batchInfoList.map((infoList: DataDeliveryFileStatus) => {
                return getDDFileStatusStyle(infoList.state, undefined);
            });
            const batchStatus = determineOverallStatus(batchEntryStatuses);

            return {
                ...batch,
                status: batchStatus
            };
        });
        
        const batchListWithStatus: DataDeliveryBatchData[] = await Promise.all(batchListPromises).then(batch => {
            return batch;
        });
        setBatchList(batchListWithStatus);
    }

    if (loading) {
        return <ONSLoadingPanel/>;
    } else {
        return (
            <div className={"elementToFadeIn"}>
                <ONSButton onClick={() => callGetBatchList()} label="Reload" primary={true} small={true}/>
                <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                    {
                        batchList && batchList.length > 0
                            ?
                            <table id="batches-table" className="table ">
                                <thead className="table__head u-mt-m">
                                <tr className="table__row">
                                    <th scope="col" className="table__header ">
                                        <span>Survey</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Data delivery run time</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Run started</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Status</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>View run status</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="table__body">
                                {
                                    batchList.map((batch: DataDeliveryBatchData, index) => {
                                        return (
                                            <tr className="table__row" key={batch.name}
                                                data-testid={"batches-table-row"}>
                                                <td className="table__cell ">
                                                    {batch.survey}
                                                </td>
                                                <td className="table__cell ">
                                                    {batch.dateString}
                                                </td>
                                                <td className="table__cell ">
                                                    {<TimeAgo live={false} date={batch.date}/>}
                                                </td>
                                                <td className="table__cell ">
                                                    <span title={`batchStatus${index}`} className={`status status--${batch.status}`}/>
                                                </td>
                                                <td className="table__cell ">
                                                    <Link
                                                        aria-label={`View run status ${batch.dateString}`}
                                                        data-testid={`view-${batch.name}`}
                                                        to={{
                                                            pathname: `/batch/${batch.name}`,
                                                            state: {batch: batch}
                                                        }
                                                        }>View run status</Link>
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
        );
    }
}

export default BatchesList;
