export interface DataDeliveryBatchData {
  survey?: string;
  date: string;
  dateString: string;
  status?: string;
  name: string;
}

export interface DataDeliveryFile {
  instrumentName: string;
}

export interface DataDeliveryFileStatus {
  batch: string;
  dd_filename: string;
  state: string;
  updated_at: string;
  instrumentName: string;
  error_info?: string | null;
}

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;
