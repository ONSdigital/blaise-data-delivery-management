import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";
import { DataDeliveryBatchData, DataDeliveryFileStatus } from "../../../interfaces";

type getBatchInfoListResponse = [boolean, DataDeliveryFileStatus[]];
type getAllBatchesResponse = [boolean, DataDeliveryBatchData[]];
type getStatusDescriptionsResponse = [boolean, { [key: string]: string }];

async function getAllBatches(): Promise<getAllBatchesResponse> {
    console.log("Call to getAllBatches");
    const url = "/api/batch";

    try {
        const [success, data]: getAllBatchesResponse = await requestPromiseJsonList("GET", url);
        console.log(`Response from get Batch Info ${(success ? "successful" : "failed")}, data list length ${data.length}`);
        return [success, data];
    } catch (error) {
        console.error(`Response from get All Batches Failed: Error ${error}`);
        return [false, []];
    }
}

async function getBatchInfo(batchName: string): Promise<getBatchInfoListResponse> {
    console.log("Call to getBatchInfo");
    const url = `/api/batch/${batchName}`;

    try {
        const [success, data]: getBatchInfoListResponse = await requestPromiseJsonList("GET", url);
        console.log(`Response from get Batch Info ${(success ? "successful" : "failed")}, data list length ${data.length}`);
        return [success, data];
    } catch (error) {
        console.error(`Response from get Batch Info Failed: Error ${error}`);
        return [false, []];
    }
}

async function getBatchStatusDescriptions(): Promise<getStatusDescriptionsResponse> {
    let list: { [key: string]: string } = {};
    console.log("Call to getBatchStatusDescriptions");
    const url = "/api/state/descriptions";

    try {
        const [status, data] = await requestPromiseJson("GET", url);
        console.log(`Response from get Batch Status Descriptions ${status}, data ${data}`);
        if (status === 200) {
            list = data;
            return [true, list];
        } else if (status === 404) {
            return [true, list];
        } 
        else {
            return [false, list];
        }
    } catch (error) {
        console.error(`Response from get Batch Status Descriptions: Error ${error}`);
        return [false, list];
    }
}

export { getAllBatches, getBatchInfo, getBatchStatusDescriptions };
