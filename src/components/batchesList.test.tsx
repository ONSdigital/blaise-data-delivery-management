/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { Router } from "react-router";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { createMemoryHistory } from "history";
import BatchesList from "./batchesList";
import {
    errorBatchRuns,
    deadBatchRuns,
    pendingBatchRuns,
    successBatchRuns,
    batches,
    errorBatchRunsWithErrorMessage
} from "./__mocks__/mock_objects";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

afterAll(() => {
    jest.clearAllMocks();
});

describe("Check BatchList component snapshot:", () => {
    beforeEach(() => {
        mock.onGet("/api/batch").reply(200, batches);
    });

    it("matches the snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("displays table headings including loader/spinner)", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
        expect(await screen.findByText(/Survey/)).toBeVisible();
        expect(await screen.findByText(/Data delivery run time/)).toBeVisible();
        expect(await screen.findByText(/Status/)).toBeVisible();
        
        const viewRunStatuses = await screen.findAllByText(/View run status/);
        for (let i = 0; i<viewRunStatuses.length; i++) {
            expect(viewRunStatuses[i]).toBeVisible();
        }

        expect(await screen.findAllByText(/View run status/)).toHaveLength(5);
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
});

describe("Check status component color:", () => {
    it("displays a red circle when a batch entry has errored ", async () => {
        mock.onGet("/api/batch").reply(200, [batches[0]]);
        mock.onGet("/api/batch/OPN_24032021_113000").reply(200, errorBatchRuns);
        
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(await screen.findByTestId(/OPN_24032021_113000-status-error/)).toBeDefined();
    });

    it("displays a red circle when an error message is present", async () => {
        mock.onGet("/api/batch").reply(200, [batches[0]]);
        mock.onGet("/api/batch/OPN_24032021_113000").reply(200, errorBatchRunsWithErrorMessage);

        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(await screen.findByTestId(/OPN_24032021_113000-status-error/)).toBeDefined();
    });

    it("displays a grey circle when a batch entry is inactive", async () => {
        mock.onGet("/api/batch").reply(200, [batches[1]]);
        mock.onGet("/api/batch/OPN_12032021_023400").reply(200, deadBatchRuns);
        
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );
        
        expect(await screen.findByTestId(/OPN_12032021_023400-status-dead/)).toBeDefined();
    });

    it("displays an amber circle when a batch entry is not in_arc, inactive or errored", async () => {
        mock.onGet("/api/batch").reply(200, [batches[2]]);
        mock.onGet("/api/batch/LM_12032021_023398").reply(200, pendingBatchRuns);
        
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(await screen.findByTestId(/LM_12032021_023398-status-pending/)).toBeDefined();
    });

    it("displays a green circle when a batch entry is in_arc", async () => {
        mock.onGet("/api/batch").reply(200, [batches[3]]);
        mock.onGet("/api/batch/LM_12032021_876000").reply(200, successBatchRuns);
        
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <BatchesList/>
            </Router>
        );

        expect(await screen.findByTestId(/LM_12032021_876000-status-success/)).toBeDefined();
    });
});
