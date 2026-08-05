import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { type ReactElement, useCallback, useEffect, useState } from "react";

import { type DataDeliveryBatchData, type DataDeliveryFileStatus } from "../../../../shared/types";
import { getBatchInfo, getBatchStatusDescriptions } from "../../../api";
import { getDataDeliveryFileStatusStyle } from "../../../utils/batchStatusColour";

type Props = {
  batch: DataDeliveryBatchData;
};

function BatchStatusList({ batch }: Props): ReactElement {
  const [batchList, setBatchList] = useState<DataDeliveryFileStatus[]>([]);
  const [statusDescriptionList, setStatusDescriptionList] = useState<{ [key: string]: string }>({});
  const [listError, setListError] = useState<string>("No data delivery files for this run found.");
  const [loading, setLoading] = useState<boolean>(true);

  const loadBatchStatusDescriptions = useCallback(async () => {
    const [success, statusDescriptions] = await getBatchStatusDescriptions();

    if (!success) {
      return;
    }

    setStatusDescriptionList(statusDescriptions);
  }, []);

  const fetchBatchList = useCallback(async () => {
    setBatchList([]);
    setLoading(true);
    setListError("No data delivery files for this run found.");

    const [success, fetchedBatchList] = await getBatchInfo(batch.name);

    setLoading(false);

    if (!success) {
      setListError("Unable to load batch info");

      return;
    }

    if (fetchedBatchList) {
      if (fetchedBatchList.length === 0) {
        setListError("No data delivery files for this run found.");
      }

      fetchedBatchList.sort(
        (a: DataDeliveryFileStatus, b: DataDeliveryFileStatus) =>
          new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf(),
      );
      setBatchList(fetchedBatchList);
    }
  }, [batch.name]);

  useEffect(() => {
    void loadBatchStatusDescriptions();
    void fetchBatchList();
  }, [fetchBatchList, loadBatchStatusDescriptions]);

  return loading ? (
    <LoadingPanel />
  ) : (
    <div>
      <Button
        onClick={() => fetchBatchList()}
        label="Reload"
        primary={true}
        small={true}
      />
      {batchList && batchList.length > 0 ? (
        <table
          id="batch-table"
          className="ons-table"
        >
          <thead className="ons-table__head ons-u-mt-m">
            <tr className="ons-table__row">
              <th
                scope="col"
                className="ons-table__header"
              >
                <span>Questionnaire</span>
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
                <span>Last update</span>
              </th>
            </tr>
          </thead>
          <tbody className="ons-table__body">
            {batchList.map(
              ({
                dd_filename,
                state,
                updated_at,
                instrumentName,
                error_info,
              }: DataDeliveryFileStatus) => {
                return (
                  <tr
                    className="ons-table__row"
                    key={dd_filename}
                    data-testid={"batch-table-row"}
                  >
                    <td className="ons-table__cell">{instrumentName}</td>
                    <td className="ons-table__cell">
                      <span
                        className={`ons-status ons-status--${getDataDeliveryFileStatusStyle(state, error_info)}`}
                        data-testid={`${instrumentName}-status--${getDataDeliveryFileStatusStyle(state, error_info)}`}
                      >
                        {error_info === null || error_info === undefined || error_info === ""
                          ? (statusDescriptionList[state] ?? state)
                          : error_info}
                      </span>
                    </td>
                    <td className="ons-table__cell">
                      {dateFormatter(updated_at).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      ) : (
        <Panel>{listError}</Panel>
      )}
    </div>
  );
}

export default BatchStatusList;
