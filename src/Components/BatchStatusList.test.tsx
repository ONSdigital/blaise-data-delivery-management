/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DataDeliveryBatchData, DataDeliveryFileStatus } from "../../Interfaces";
import { MemoryRouter } from "react-router-dom";
import BatchStatusList from "./BatchStatusList";
import { statusDescriptions } from "./__mocks__/mock_objects";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import dateFormatter from "dayjs";
 
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const batches: DataDeliveryBatchData[] = [
    {
        survey: "OPN",
        date: new Date("2021-03-24T11:30:00.000Z"),
        dateString: "24/03/2021 11:30:00",
        name: "OPN_24032021_113000"
    }
];

const batchRuns: DataDeliveryFileStatus[] = [
    {
        batch: "OPN_24032021_113000",
        dd_filename: "OPN2004A__26032021_121540.zip",
        instrumentName: "OPN2004A",
        state: "in_arc",
        updated_at: "2021-03-24T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2101A_26032031_121540.zip",
        instrumentName: "OPN2101A",
        state: "generated",
        updated_at: "2021-03-25T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2331A_26032081_121540.zip",
        instrumentName: "OPN2331A",
        state: "inactive",
        updated_at: "2021-03-26T12:21:10+00:00",
        error_info: ""
    },
    {
        batch: "OPN_24032021_113000",
        dd_filename: "dd_OPN2806A_26032051_121540.zip",
        instrumentName: "OPN2806A",
        state: "errored",
        updated_at: "2021-03-27T12:21:10+00:00",
        error_info: ""
    }
];

const mockRoute = `/batch/${batches[0].name}`;

beforeAll(() => {
    mock.onGet("/api/batch").reply(200, batches);
    mock.onGet(`/api/batch/${batches[0].name}`).reply(200, batchRuns);
});

afterAll(() => {
    jest.clearAllMocks();
});

describe("Check BatchStatusList component snapshot:", () => {
    it("matches the snapshot", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <BatchStatusList statusDescriptionList={statusDescriptions} />
            </MemoryRouter>
        );
        
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        expect(await screen.findByText(/Questionnaire/)).toBeVisible();
        expect(await screen.findByText(/Status/)).toBeVisible();
        expect(await screen.findByText(/Last update/)).toBeVisible();
    });
});

describe("Check run table:", () => {
    it("displays table headings (including loader/spinner)", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <BatchStatusList statusDescriptionList={statusDescriptions} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        expect(await screen.findByText(/Questionnaire/)).toBeVisible();
        expect(await screen.findByText(/Status/)).toBeVisible();
        expect(await screen.findByText(/Last update/)).toBeVisible();
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    it("displays the questionnaire/instrument names", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <BatchStatusList statusDescriptionList={statusDescriptions} />
            </MemoryRouter>
        );

        expect(await screen.findByText(/OPN2004A/)).toBeVisible();
        expect(await screen.findByText(/OPN2101A/)).toBeVisible();
        expect(await screen.findByText(/OPN2331A/)).toBeVisible();
        expect(await screen.findByText(/OPN2806A/)).toBeVisible();
    });

    it("displays the status colour and details", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <BatchStatusList statusDescriptionList={statusDescriptions} />
            </MemoryRouter>
        );

        expect(await screen.findByText(statusDescriptions["in_arc"])).toBeVisible();
        expect(await screen.findByTestId(/OPN2004A-status--success/)).toBeDefined();
        expect(await screen.findByText(statusDescriptions["generated"])).toBeVisible();
        expect(await screen.findByTestId(/OPN2101A-status--pending/)).toBeDefined();
        expect(await screen.findByText(statusDescriptions["inactive"])).toBeVisible();
        expect(await screen.findByTestId(/OPN2331A-status--dead/)).toBeDefined();
        expect(await screen.findByText(statusDescriptions["errored"])).toBeVisible();
        expect(await screen.findByTestId(/OPN2806A-status--error/)).toBeDefined();
    });

    it("displays last update details", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <BatchStatusList statusDescriptionList={statusDescriptions} />
            </MemoryRouter>
        );
        
        expect(await screen.findByText(dateFormatter(batchRuns[0].updated_at).format("DD/MM/YYYY HH:mm:ss"))).toBeVisible(); // 24/03/2021 12:21:10
        expect(await screen.findByText(dateFormatter(batchRuns[1].updated_at).format("DD/MM/YYYY HH:mm:ss"))).toBeVisible(); // 25/03/2021 12:21:10
        expect(await screen.findByText(dateFormatter(batchRuns[2].updated_at).format("DD/MM/YYYY HH:mm:ss"))).toBeVisible(); // 26/03/2021 12:21:10
        expect(await screen.findByText(dateFormatter(batchRuns[3].updated_at).format("DD/MM/YYYY HH:mm:ss"))).toBeVisible(); // 27/03/2021 12:21:10
    });
});
