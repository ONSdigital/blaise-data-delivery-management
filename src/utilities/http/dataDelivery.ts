import { requestPromiseJson } from "./requestPromise";

async function sendDataDeliveryRequest(): Promise<boolean> {
    console.log("Sending request to trigger data delivery");
    const url = "/api/trigger";

    try {
        const [status, data] = await requestPromiseJson("POST", url);

        console.log(`Response from trigger data delivery: Status ${status}, data ${data}`);
        if (status !== 200) {
            return false;
        }

        if (data === "completed") {
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Failed to trigger data delivery, Error ${error}`);

        return false;
    }
}

export { sendDataDeliveryRequest };
