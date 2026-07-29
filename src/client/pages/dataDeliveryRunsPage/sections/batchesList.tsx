import React, { type ReactElement, useEffect, useState } from "react";
import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getAllBatches, getBatchInfo } from "../../../api";
import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../../../types";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";

import { getDataDeliveryFileStatusStyle } from "../../../utils/batchStatusColour";

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

function parseLondonDateString(dateString: string): Date {
    const parsedDate = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/);

    if (parsedDate == null) {
        return new Date(dateString);
    }

    const [, day, month, year, hour, minute, second] = parsedDate;
    const targetDateAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    const utcGuess = targetDateAsUtc;

    const londonDateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(new Date(utcGuess));

    const londonDateMap = londonDateParts.reduce<Record<string, string>>((accumulator, part) => {
        if (part.type !== "literal") {
            accumulator[part.type] = part.value;
        }

        return accumulator;
    }, {});

    const londonGuessAsUtc = Date.UTC(
        Number(londonDateMap.year),
        Number(londonDateMap.month) - 1,
        Number(londonDateMap.day),
        Number(londonDateMap.hour),
        Number(londonDateMap.minute),
        Number(londonDateMap.second)
    );

    return new Date(utcGuess + (targetDateAsUtc - londonGuessAsUtc));
}

function getBatchRunStartedDate(batch: DataDeliveryBatchData): Date {
    const parsedDate = parseLondonDateString(batch.dateString);

    if (Number.isNaN(parsedDate.valueOf())) {
        return new Date(batch.date);
    }

    return parsedDate;
}

function BatchesList(): ReactElement {
    const [batchList, setBatchList] = useState<DataDeliveryBatchData[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchBatchList().then(() => console.log("fetchBatchList Complete"));
    }, []);

    async function fetchBatchList() {
        setBatchList([]);
        setLoading(true);

        const [success, fetchedBatches] = await getAllBatches() as [boolean, DataDeliveryBatchData[]];

        setLoading(false);

        if (!success) {
            setListError("Unable to load data delivery run list");

            return;
        }

        if (fetchedBatches) {
            if (fetchedBatches.length === 0) {
                setListError("No data delivery runs found.");
            }

            fetchedBatches.sort((a: DataDeliveryBatchData, b: DataDeliveryBatchData) => getBatchRunStartedDate(b).valueOf() - getBatchRunStartedDate(a).valueOf());

            const batchListPromises = fetchedBatches.slice(0, 50).map(async (batch: DataDeliveryBatchData) => {
                const [success, batchInfoList] = await getBatchInfo(batch.name) as [boolean, DataDeliveryFileStatus[]];

                if (!success) {
                    return {
                        ...batch,
                        status: "dead"
                    };
                }

                const batchEntryStatuses: string[] = batchInfoList.map((fileStatus: DataDeliveryFileStatus) => {
                    return getDataDeliveryFileStatusStyle(fileStatus.state, fileStatus.error_info);
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
                <ONSButton onClick={() => fetchBatchList()} label="Reload" primary={true} small={true} />
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
                                                        {<TimeAgo live={false} date={getBatchRunStartedDate(batch)} />}
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
                                                            to={`/batch/${batch.name}`}
                                                            state={{ batch: batch }}
                                                        >
                                                            View run status
                                                        </Link>
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
