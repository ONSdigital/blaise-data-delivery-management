import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";
import { DataDeliveryBatchData, DataDeliveryFile, DataDeliveryFileStatus } from "../../../Interfaces";

type getResponseList = [boolean, DataDeliveryFileStatus[] | DataDeliveryBatchData[] | { [key: string]: string } | null]

type getResponse = [number | boolean, string | DataDeliveryFileStatus | DataDeliveryFile | DataDeliveryBatchData | { [key: string]: string } | null]

async function getAllBatches(): Promise<getResponseList> {
    console.log("Call to getAllBatches");
    const url = "/api/batch";

    try {
        const [success, data]: getResponseList = await requestPromiseJsonList("GET", url);
        console.log(`Response from get Batch Info ${(success ? "successful" : "failed")}, data list length ${data.length}`);
        return [success, data];
    } catch (error) {
        console.error(`Response from get All Batches Failed: Error ${error}`);
        return [false, []];
    }
}

async function getBatchInfo(batchName: string): Promise<getResponseList> {
    console.log("Call to getBatchInfo");
    const url = `/api/batch/${batchName}`;

    try {
        const [success, data]: getResponseList = await requestPromiseJsonList("GET", url);
        console.log(`Response from get Batch Info ${(success ? "successful" : "failed")}, data list length ${data.length}`);
        return [success, data];
    } catch (error) {
        console.error(`Response from get Batch Info Failed: Error ${error}`);
        return [false, []];
    }
}

async function getBatchStatusDescriptions(): Promise<getResponse> {

    console.log("Call to getBatchStatusDescriptions");
    const url = "/api/state/descriptions";

    try {
        const [status, data] = await requestPromiseJson("GET", url);
        console.log(`Response from get Batch Status Descriptions ${status}, data ${data}`);
        if (status === 200) {
            return [true, data];
        } else if (status === 404) {
            return [true, {}];
        }
        else {
            return [false, {}];
        }
    } catch (error) {
        console.error(`Response from get Batch Status Descriptions: Error ${error}`);
        return [false, {}];
    }
}

export { getAllBatches, getBatchInfo, getBatchStatusDescriptions };
