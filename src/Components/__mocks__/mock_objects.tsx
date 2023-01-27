import { DataDeliveryBatchData, DataDeliveryFileStatus } from "../../../Interfaces";

export const statusDescriptions = {
    "inactive": "The data delivery instrument has no active survey days, we will not generate a data delivery file, we should never alert",
    "started": "The data delivery process has found an instrument with active survey days",
    "generated": "The data delivery process has generated the required files",
    "in_staging": "The data delivery files have been copied to the staging bucket",
    "encrypted": "The data delivery files have been encrypted and are ready for NiFi",
    "in_nifi_bucket": "The data delivery files are in the NiFi bucket",
    "nifi_notified": "NiFi has been notified that we have files to ingest",
    "in_arc": "NiFi has copied the files to ARC (on prem) and sent a receipt",
    "errored": "An error has occurred processing the file (error receipt from NiFi for example)",
};

export const batches: DataDeliveryBatchData[] = [
    {
        survey: "OPN",
        date: new Date("2021-03-24T11:30:00.000Z"),
        dateString: "24/03/2021 11:30:00",
        name: "OPN_24032021_113000"
    },
    {
        survey: "OPN",
        date: new Date("2021-03-12T02:30:00.000Z"),
        dateString: "12/03/2021 02:30:00",
        name: "OPN_12032021_023400"
    },
    {
        survey: "LM",
        date: new Date("2021-03-12T02:30:00.000Z"),
        dateString: "13/03/2021 04:30:00",
        name: "LM_12032021_023398"
    },
    {
        survey: "LM",
        date: new Date("2021-03-12T02:30:00.000Z"),
        dateString: "11/03/2021 09:30:00",
        name: "LM_12032021_876000"
    }
];

export const errorBatchRuns: DataDeliveryFileStatus[] = [
    {
        batch: "OPN_24032021_113000",
        dd_filename: "OPN2004A",
        instrumentName: "OPN2004A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "errored",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    }
];

export const errorBatchRunsWithErrorMessage: DataDeliveryFileStatus[] = [
    {
        batch: "OPN_24032021_113000",
        dd_filename: "OPN2004A",
        instrumentName: "OPN2004A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: "conection reset by peer"
    }
];

export const deadBatchRuns: DataDeliveryFileStatus[] = [
    {
        batch: "OPN_12032021_023400",
        dd_filename: "OPN2004A",
        instrumentName: "OPN2004A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_12032021_023400",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "generated",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_12032021_023400",
        dd_filename: "dd_OPN2101A_26032021_121540.zip",
        instrumentName: "OPN2101A",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    }
];

export const pendingBatchRuns: DataDeliveryFileStatus[] = [
    {
        batch: "LM_12032021_023398",
        dd_filename: "LM2004A",
        instrumentName: "LM2004A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "LM_12032021_023398",
        dd_filename: "dd_LM2101A_26032021_121540.zip",
        instrumentName: "LM2101A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "LM_12032021_023398",
        dd_filename: "dd_LM2101A_26032021_121540.zip",
        instrumentName: "LM2101A",
        state: "chicken",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    }
];

export const successBatchRuns: DataDeliveryFileStatus[] = [
    {
        batch: "LM_12032021_876000",
        dd_filename: "LM2004A",
        instrumentName: "LM2004A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "LM_12032021_876000",
        dd_filename: "dd_LM2101A_26032021_121540.zip",
        instrumentName: "LM2101A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "LM_12032021_876000",
        dd_filename: "dd_LM2101A_26032021_121540.zip",
        instrumentName: "LM2101A",
        state: "in_arc",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    }
];
