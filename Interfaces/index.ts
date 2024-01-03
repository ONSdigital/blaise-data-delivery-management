interface DataDeliveryBatchData {
    survey?: string
    date: Date
    dateString: string,
    status?: string,
    name: string
}

interface DataDeliveryFile {
    prefix: string
    instrumentName: string
}

interface DataDeliveryFileStatus {
    batch: string
    dd_filename: string
    state: string
    updated_at: string
    instrumentName: string
    error_info: string
}

type JSONObject =
    | string
    | number
    | boolean
    | DataDeliveryBatchData
    | { [x: string]: JSONObject }
    | Array<JSONObject>;

export type { DataDeliveryFile, DataDeliveryBatchData, DataDeliveryFileStatus, JSONObject };
