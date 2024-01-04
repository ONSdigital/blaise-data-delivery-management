import { DataDeliveryBatchData, JSONValue } from "../../../Interfaces";

export function mock_fetch_requests(mock_server_responses: (url: string) =>
    Promise<{
        status: number;
        json: () => Promise<string>;
    }> |
    Promise<{
        status: number;
        json: () => Promise<DataDeliveryBatchData[]>;
    }> |
    Promise<{
        status: number;
        json: () => Promise<JSONValue>;
    }> |
    undefined
) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn((url: string) => mock_server_responses(url));
}
