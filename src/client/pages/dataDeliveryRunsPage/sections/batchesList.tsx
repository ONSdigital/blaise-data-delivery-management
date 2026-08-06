import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import { type ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";

import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../../../../shared/types";
import { getAllBatches, getBatchInfo } from "../../../api";
import { getDataDeliveryFileStatusStyle } from "../../../utils/batchStatusColour";
import { determineOverallStatus, getBatchRunStartedDate } from "../../../utils/dataDeliveryRun";

const DAYS_OF_BATCH_HISTORY = 7;

function BatchesList(): ReactElement {
  const [batchList, setBatchList] = useState<DataDeliveryBatchData[]>([]);
  const [listError, setListError] = useState<string>("Loading ...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void fetchBatchList();
  }, []);

  async function fetchBatchList() {
    setBatchList([]);
    setLoading(true);

    try {
      const [success, fetchedBatches] = await getAllBatches();

      if (!success) {
        setListError("Unable to load data delivery run list");

        return;
      }

      if (fetchedBatches) {
        if (fetchedBatches.length === 0) {
          setListError("No data delivery runs found.");
        }

        fetchedBatches.sort(
          (a: DataDeliveryBatchData, b: DataDeliveryBatchData) =>
            getBatchRunStartedDate(b).valueOf() - getBatchRunStartedDate(a).valueOf(),
        );

        const cutoffDate = new Date(Date.now() - DAYS_OF_BATCH_HISTORY * 24 * 60 * 60 * 1000);

        const batchesFromLastWeek = fetchedBatches.filter((batch: DataDeliveryBatchData) => {
          return getBatchRunStartedDate(batch).valueOf() >= cutoffDate.valueOf();
        });

        if (batchesFromLastWeek.length === 0) {
          setListError("No data delivery runs found.");
        }

        const batchListPromises = batchesFromLastWeek.map(async (batch: DataDeliveryBatchData) => {
          const [success, batchInfoList] = await getBatchInfo(batch.name);

          if (!success) {
            return {
              ...batch,
              status: "dead",
            };
          }

          const batchEntryStatuses: string[] = batchInfoList.map(
            (fileStatus: DataDeliveryFileStatus) => {
              return getDataDeliveryFileStatusStyle(fileStatus.state, fileStatus.error_info);
            },
          );
          const batchStatus = determineOverallStatus(batchEntryStatuses);

          return {
            ...batch,
            status: batchStatus,
          };
        });

        const batchListWithStatus: DataDeliveryBatchData[] = await Promise.all(batchListPromises);

        setBatchList(batchListWithStatus);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingPanel />;
  }

  return (
    <div>
      <Button
        onClick={() => fetchBatchList()}
        label="Reload"
        primary={true}
        small={true}
      />
      {batchList && batchList.length > 0 ? (
        <table
          id="batches-table"
          className="ons-table"
        >
          <thead className="ons-table__head ons-u-mt-m">
            <tr className="ons-table__row">
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>Survey</span>
              </th>
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>Data delivery run time</span>
              </th>
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>Run started</span>
              </th>
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>Status</span>
              </th>
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>View run status</span>
              </th>
            </tr>
          </thead>
          <tbody className="ons-table__body">
            {batchList.map((batch: DataDeliveryBatchData) => {
              return (
                <tr
                  className="ons-table__row"
                  key={batch.name}
                  data-testid={"batches-table-row"}
                >
                  <td className="ons-table__cell">{batch.survey}</td>
                  <td className="ons-table__cell">{batch.dateString}</td>
                  <td className="ons-table__cell">
                    {
                      <TimeAgo
                        live={false}
                        date={getBatchRunStartedDate(batch)}
                      />
                    }
                  </td>
                  <td className="ons-table__cell">
                    <span
                      className={`ons-status ons-status--${batch.status}`}
                      aria-label={`Survey ${batch.name} overall status is ${batch.status}`}
                      data-testid={`${batch.name}-status-${batch.status}`}
                    />
                  </td>
                  <td className="ons-table__cell">
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
            })}
          </tbody>
        </table>
      ) : (
        <Panel>{listError}</Panel>
      )}
    </div>
  );
}

export default BatchesList;
