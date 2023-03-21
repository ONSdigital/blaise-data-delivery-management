// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import App from "../../app";
import { Router } from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { BatchInfoList, BatchList, StatusDescriptions } from "./mock_objects";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/view_run_status.feature",
    { tagFilter: "not @server and not @integration" }
);

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
        mock.onGet("/api/batch/OPN_26032021_112954").reply(200, BatchInfoList);
        mock.onGet("/api/batch").reply(200, BatchList);
        mock.onGet("/api/state/descriptions").reply(200, StatusDescriptions);
    });

    test("List all recent Data Delivery runs", ({ given, when, then, and }) => {
        given("I have launched the Data Delivery Management", () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
        });

        when("I view the landing page", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a list of the recent data delivery runs", () => {
            expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
            expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();
            expect(screen.getByText(/25\/03\/2021 14:58:38/i)).toBeDefined();
            expect(screen.getByText(/24\/03\/2021 16:50:33/i)).toBeDefined();
        });

        and("it is ordered with the most recently run at the top", () => {
            const list = screen.queryAllByTestId(/batches-table-row/i);
            const listItemOne = list[0];
            const firstRowData = listItemOne.childNodes[1];
            if (firstRowData !== null) {
                expect(firstRowData.textContent).toEqual("26/03/2021 11:29:54");
            }
            const listItemTwo = list[1];
            const secondRowData = listItemTwo.childNodes[1];
            if (secondRowData !== null) {
                expect(secondRowData.textContent).toEqual("25/03/2021 14:58:38");
            }
            const listItemThree = list[2];
            const thirdRowData = listItemThree.childNodes[1];
            if (thirdRowData !== null) {
                expect(thirdRowData.textContent).toEqual("24/03/2021 16:50:33");
            }
        });
    });

    test("View run status", ({ given, when, then, and }) => {
        given("I can see the run I wish to see the status of", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
            expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();

        });

        when("I select the 'View run status' link", async () => {
            await act(async () => {
                fireEvent.click(screen.getByTestId(/view-OPN_26032021_112954/));
                await flushPromises();
            });
        });

        then("I am presented with a list of the surveys processed in that run", () => {
            expect(screen.getByText(/Delivery trigger/i));
            expect(screen.getByText(/26\/03\/2021 11:29/i)).toBeDefined();
            expect(screen.getByText(/OPN2101A/i)).toBeDefined();
            expect(screen.getByText(/OPN2004A/i)).toBeDefined();
        });

        and("the status information is shown", () => {
            const list = screen.queryAllByTestId(/batch-table-row/i);
            const listItemOne = list[0];
            const firstRowData = listItemOne.childNodes;
            if (firstRowData !== null) {
                expect(firstRowData[0].textContent).toEqual("OPN2004A");
                expect(firstRowData[1].textContent).toEqual("The data delivery instrument has no active survey days, we will not generate a data delivery file, we should never alert");
            }
            const listItemTwo = list[1];
            const secondRowData = listItemTwo.childNodes;
            if (secondRowData !== null) {
                expect(secondRowData[0].textContent).toEqual("OPN2101A");
                expect(secondRowData[1].textContent).toEqual("The data delivery process has generated the required files");
            }
            const listItemThree = list[2];
            const thirdRowData = listItemThree.childNodes;
            if (secondRowData !== null) {
                expect(thirdRowData[0].textContent).toEqual("OPN2106A");
                expect(thirdRowData[1].textContent).toEqual("Some error_info was here and that");
            }
        });
    });
});
