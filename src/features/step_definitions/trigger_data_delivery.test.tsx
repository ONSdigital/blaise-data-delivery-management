// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import App from "../../App";
import { Router } from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { mock_fetch_requests } from "./functions";
import { BatchList, StatusDescriptions } from "./mock_objects";

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/trigger_data_delivery.feature",
    { tagFilter: "not @server and not @integration" }
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/api/trigger")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve("completed"),
        });
    } else if (url.includes("/api/batch")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(BatchList),
        });
    } else if (url.includes("/api/state/descriptions")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(StatusDescriptions),
        });
    }
};

const mock_server_responses_trigger_fails = (url: string) => {
    console.log(url);
    if (url.includes("/api/trigger")) {
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve("failed"),
        });
    } else if (url.includes("/api/batch")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(BatchList),
        });
    } else if (url.includes("/api/state/descriptions")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(StatusDescriptions),
        });
    }
};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });

    test.skip("Trigger data delivery", ({ given, when, then, and }) => {
        given("I have launched the Data Delivery Management", async () => {
            mock_fetch_requests(mock_server_responses);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
        });

        when("I click the link 'Trigger Data Delivery'", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/Trigger Data Delivery/));
            });

        });

        and("I confirm I want to trigger Data Delivery", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/Yes, trigger Data Delivery/));
                await flushPromises();
                fireEvent.click(screen.getByText(/Continue/));
                await flushPromises();
            });
        });

        then("Data Delivery will be triggered", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        and("I will be redirect to the homepage with a message saying it had been triggered successfully", async () => {
            await waitFor((() => {
                expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
                expect(screen.getByText(/Triggered Data Delivery successfully, It may take a few minutes for the run to appear in the table below./i)).toBeDefined();
            }));
        });
    });

    test.skip("Trigger data delivery fails", ({ given, when, then, and }) => {
        given("I have launched the Data Delivery Management", async () => {
            mock_fetch_requests(mock_server_responses_trigger_fails);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
        });

        when("I click the link 'Trigger Data Delivery'", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/Trigger Data Delivery/));
            });
        });

        and("I confirm I want to trigger Data Delivery", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/Yes, trigger Data Delivery/));
                await flushPromises();
                fireEvent.click(screen.getByText(/Continue/));
                await flushPromises();
            });
        });

        then("Data Delivery will be triggered", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        and("Data Delivery fails", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        and("I will be redirect to the homepage with a message saying the the trigger had failed", async () => {
            await waitFor((() => {
                expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
                expect(screen.getByText(/Failed to trigger Data Delivery./i)).toBeDefined();
            }));
        });
    });

    test.skip("Cancel Trigger data delivery", ({ given, when, then }) => {
        given("I have been presented with a confirmation to trigger data delivery", async () => {
            mock_fetch_requests(mock_server_responses_trigger_fails);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
                fireEvent.click(screen.getByText(/Trigger Data Delivery/));
                await flushPromises();
            });
            await waitFor((() => {
                expect(screen.getByText(/Are you sure you want to trigger Data Delivery?/i)).toBeDefined();
            }));
        });

        when("I confirm that I do NOT want to proceed", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/No, do not trigger Data Delivery/));
                await flushPromises();
                fireEvent.click(screen.getByText(/Continue/));
                await flushPromises();
            });
        });

        then("I am returned to the landing page", async () => {
            await waitFor((() => {
                expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
            }));
        });
    });

    test.skip("Cancel Trigger data delivery confirmation", ({ given, when, then }) => {
        given("I have been presented with a confirmation to trigger data delivery", async () => {
            mock_fetch_requests(mock_server_responses_trigger_fails);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
                fireEvent.click(screen.getByText(/Trigger Data Delivery/));
                await flushPromises();
            });
            await waitFor((() => {
                expect(screen.getByText(/Are you sure you want to trigger Data Delivery?/i)).toBeDefined();
            }));
        });

        when("I click the cancel button", async () => {
            await act(async () => {
                await flushPromises();
                fireEvent.click(screen.getByText(/Cancel/));
                await flushPromises();
                await flushPromises();
            });
        });

        then("I am returned to the landing page", async () => {
            await waitFor((() => {
                expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
            }));
        });
    });

    test.skip("Don't select an option", ({ given, when, then }) => {
        given("I have been presented with a confirmation to trigger data delivery", async () => {
            mock_fetch_requests(mock_server_responses_trigger_fails);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
                fireEvent.click(screen.getByText(/Trigger Data Delivery/));
                await flushPromises();
            });
            await waitFor((() => {
                expect(screen.getByText(/Are you sure you want to trigger Data Delivery?/i)).toBeDefined();
            }));
        });

        when("I select confirm without choosing an option", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText(/Continue/));
                await flushPromises();
            });
        });

        then("I am presented with message telling me to choose an option", async () => {
            await waitFor((() => {
                expect(screen.queryByText(/Data delivery runs/i)).not.toBeInTheDocument();
                expect(screen.getByText(/Select an answer/i)).toBeDefined();
            }));
        });
    });
});
