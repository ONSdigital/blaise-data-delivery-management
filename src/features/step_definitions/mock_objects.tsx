import { DataDeliveryBatchData } from "../../../interfaces";

export const BatchList: DataDeliveryBatchData[] = [
    { survey: "OPN", date: new Date("2021-03-26T11:29:54.000Z"), dateString: "26/03/2021 11:29:54", name: "OPN_26032021_112954" },
    { survey: "OPN", date: new Date("2021-03-25T14:58:38.000Z"), dateString: "25/03/2021 14:58:38", name: "OPN_25032021_145838" },
    { survey: "OPN", date: new Date("2021-03-24T16:50:33.000Z"), dateString: "24/03/2021 16:50:33", name: "OPN_24032021_165033" }
];

export const BatchInfoList = [
    {
        batch: "OPN_26032021_112954",
        dd_filename: "OPN2004A",
        instrumentName: "OPN2004A",
        prefix: "dd",
        state: "inactive",
        updated_at: "2021-03-26T12:29:54.000Z"
    },
    {
        batch: "OPN_26032021_112954",
        dd_filename: "dd_OPN2101A_26032021_112954.zip",
        instrumentName: "OPN2101A",
        prefix: "dd",
        state: "generated",
        updated_at: "2021-03-26T12:29:54.000Z"
    },
    {
        batch: "OPN_26032021_112954",
        dd_filename: "dd_OPN2106A_26032021_112954.zip",
        instrumentName: "OPN2106A",
        prefix: "dd",
        state: "generated",
        updated_at: "2021-03-26T12:29:54.000Z",
        error_info: "Some error_info was here and that"
    }
];

export const StatusDescriptions = {
    "inactive": "The data delivery instrument has no active survey days, we will not generate a data delivery file, we should never alert",
    "started": "The data delivery process has found an instrument with active survey days",
    "generated": "The data delivery process has generated the required files",
    "errored": "An error has occurred processing the file (error receipt from NiFi for example)",
};
