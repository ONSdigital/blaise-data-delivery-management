// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { BatchList } from "./mock_objects";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/view_run_exceptions.feature",
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

    test("List all recent Data Delivery runs fails", ({ given, when, then }) => {
        given("I have launched the Data Delivery Management", () => {
            mock.onGet("/api/batch/OPN_26032021_112954").reply(500, {});
            mock.onGet("/api/batch").reply(500, {});

            render(
                <MemoryRouter initialEntries={["/"]}> 
                    <App />
                </MemoryRouter>
            );
        });

        when("I view the landing page and the list fails to load", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a message saying that there is an issue", () => {
            expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
            expect(screen.getByText(/Unable to load data delivery run list/i)).toBeDefined();
        });
    });

    test("View run status fails", ({ given, when, then, and }) => {
        given("I can see the run I wish to see the status of", async () => {
            mock.onGet("/api/batch/OPN_26032021_112954").reply(500, {});
            mock.onGet("/api/batch").reply(200, BatchList);
            
            render(
                <MemoryRouter initialEntries={["/"]}>
                    <App />
                </MemoryRouter>
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

        and("the list fails to load", () => {
            return;
        });

        then("I am presented with a message saying that there is an issue", () => {
            expect(screen.getByText(/Delivery trigger/i));
            expect(screen.getByText(/26\/03\/2021 11:29/i)).toBeDefined();
            expect(screen.getByText(/Unable to load batch info/i)).toBeDefined();
        });
    });
});
