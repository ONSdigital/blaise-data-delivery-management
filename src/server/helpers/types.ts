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

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

export type { DataDeliveryFile, DataDeliveryBatchData, DataDeliveryFileStatus, JSONValue };
