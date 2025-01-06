// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../../App";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { BatchList, StatusDescriptions } from "./mock_objects";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/view_run_status_empty_lists.feature",
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
    });

    test("No recent Data Delivery runs found", ({ given, when, then }) => {

        given("I have launched the Data Delivery Management", () => {
            mock.onGet("/api/batch").reply(200, []);
            mock.onGet("/api/state/descriptions").reply(200, StatusDescriptions);
            render(
                <MemoryRouter>
                    <App />
                </MemoryRouter>
            );

        });

        when("I view the landing page", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a message saying that there are no runs found", () => {
            expect(screen.getByText(/Data delivery runs/)).toBeDefined();
            expect(screen.getByText(/No data delivery runs found./i)).toBeDefined();
        });
    });

    test("No files found in run", ({ given, when, then }) => {

        given("I can see the run I wish to see the status of", async () => {
            mock.onGet("/api/batch").reply(200, BatchList);
            mock.onGet("/api/batch/OPN_26032021_112954").reply(200, []);
            mock.onGet("/api/state/descriptions").reply(200, StatusDescriptions);
            render(
                <MemoryRouter>
                    <App />
                </MemoryRouter>
            );

        });

        when("I view the landing page", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a list of runs", () => {
            expect(screen.getByText(/Data delivery runs/)).toBeDefined();
            expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();
            expect(screen.getByText(/25\/03\/2021 14:58:38/i)).toBeDefined();
            expect(screen.getByText(/24\/03\/2021 16:50:33/i)).toBeDefined();
        });

        when("I select the 'View run status' link", async () => {
            await act(async () => {
                fireEvent.click(screen.getByTestId(/view-OPN_26032021_112954/));
                await flushPromises();
            });
        });

        then("I am presented with a message saying that there are no files found", () => {
            expect(screen.getByText(/Delivery trigger/i));
            expect(screen.getByText(/No data delivery files for this run found./i)).toBeDefined();
        });
    });
});
