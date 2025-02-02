import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { DataDeliveryBatchData } from "../Interfaces";
import MockDate from "mockdate";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import App from "./App";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("React homepage", () => {
    const batches: DataDeliveryBatchData[] = [
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
            name: "OPN_12032021_023000"
        }
    ];

    beforeAll(() => {
        MockDate.set(new Date("2021-03-30T02:30:00.000Z"));
        mock.onGet("/api/batch").reply(200, batches);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        MockDate.reset();
    });

    it("view instrument page matches Snapshot", async () => {
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const { getByText, queryByText, getAllByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Data Delivery Management/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(/Data Delivery Management/i)).toBeDefined();
            expect(getByText(/24\/03\/2021 11:30:00/i)).toBeDefined();
            expect(getByText(/12\/03\/2021 02:30:00/i)).toBeDefined();
            expect(getAllByText(/View run status/i)).toBeDefined();
            expect(getByText(/Status/)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns an empty list", () => {
    beforeAll(() => {
        mock.onGet("/api/batch").reply(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No data delivery runs found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
