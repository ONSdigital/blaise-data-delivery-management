import React, { ReactElement, useEffect, useState } from "react";
import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getAllBatches } from "../utilities/http";
import { DataDeliveryBatchData } from "../../Interfaces";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";

import { DataDeliveryFileStatus } from "../../Interfaces";
import { getBatchInfo } from "../utilities/http";
import { getDDFileStatusStyle } from "../utilities/BatchStatusColour";

function determineOverallStatus(batchEntryStatuses: string[]) {
    const hasRedAlerts: boolean = batchEntryStatuses.includes("error");
    const hasGreyAlerts: boolean = batchEntryStatuses.includes("dead");
    const hasAmberAlerts: boolean = batchEntryStatuses.includes("pending");

    if (hasRedAlerts) {
        return "error";
    }
    if (hasGreyAlerts) {
        return "dead";
    }
    if (hasAmberAlerts) {
        return "pending";
    }
    return "success";
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

        const [success, batchListResponse] = await getAllBatches() as [boolean, DataDeliveryBatchData[]];
        setLoading(false);

        if (!success) {
            setListError("Unable to load data delivery run list");
            return;
        }

        if (batchListResponse) {
            if (batchListResponse.length === 0) {
                setListError("No data delivery runs found.");
            }

            batchListResponse.sort((a: DataDeliveryBatchData, b: DataDeliveryBatchData) => new Date(b.date).valueOf() - new Date(a.date).valueOf());

            const batchListPromises = batchListResponse.slice(0, 50).map(async (batch: DataDeliveryBatchData) => {
                const [success, batchInfoList] = await getBatchInfo(batch.name) as [boolean, DataDeliveryFileStatus[]];

                if (!success) {
                    return {
                        ...batch,
                        status: "dead"
                    };
                }

                const batchEntryStatuses: string[] = batchInfoList.map((infoList: DataDeliveryFileStatus) => {
                    return getDDFileStatusStyle(infoList.state, infoList.error_info);
                });
                const batchStatus = determineOverallStatus(batchEntryStatuses);

                return {
                    ...batch,
                    status: batchStatus
                };
            });

            const batchListWithStatus: DataDeliveryBatchData[] = await Promise.all(batchListPromises);
            setBatchList(batchListWithStatus);
        }

    }

    if (loading) {
        return <ONSLoadingPanel />;
    } else {
        return (
            <div className={"elementToFadeIn"}>
                <ONSButton onClick={() => callGetBatchList()} label="Reload" primary={true} small={true} />
                <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                    {
                        batchList && batchList.length > 0
                            ?
                            <table id="batches-table" className="ons-table ">
                                <thead className="ons-table__head ons-u-mt-m">
                                    <tr className="ons-table__row">
                                        <th scope="col" className="ons-table__header ">
                                            <span>Survey</span>
                                        </th>
                                        <th scope="col" className="ons-table__header ">
                                            <span>Data delivery run time</span>
                                        </th>
                                        <th scope="col" className="ons-table__header ">
                                            <span>Run started</span>
                                        </th>
                                        <th scope="col" className="ons-table__header ">
                                            <span>Status</span>
                                        </th>
                                        <th scope="col" className="ons-table__header ">
                                            <span>View run status</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="ons-table__body">
                                    {
                                        batchList.map((batch: DataDeliveryBatchData) => {
                                            return (
                                                <tr className="ons-table__row" key={batch.name}
                                                    data-testid={"batches-table-row"}>
                                                    <td className="ons-table__cell ">
                                                        {batch.survey}
                                                    </td>
                                                    <td className="ons-table__cell ">
                                                        {batch.dateString}
                                                    </td>
                                                    <td className="ons-table__cell ">
                                                        {<TimeAgo live={false} date={batch.date} />}
                                                    </td>
                                                    <td className="ons-table__cell ">
                                                        <span className={`ons-status ons-status--${batch.status}`}
                                                            aria-label={`Survey ${batch.name} overall status is ${batch.status}`}
                                                            data-testid={`${batch.name}-status-${batch.status}`}
                                                        />
                                                    </td>
                                                    <td className="ons-table__cell ">
                                                        <Link
                                                            aria-label={`View run status ${batch.dateString}`}
                                                            data-testid={`view-${batch.name}`}
                                                            to={{
                                                                pathname: `/batch/${batch.name}`,
                                                                state: { batch: batch }
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
