export function mock_fetch_requests(mock_server_responses: any): void{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn((url: string) => mock_server_responses(url));
}
