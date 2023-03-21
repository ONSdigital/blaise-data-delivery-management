/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { Switch, Route, Router } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { createMemoryHistory } from "history";
import userEvent from "@testing-library/user-event";
import Confirmation from "./confirmation";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const mockRoute = "/trigger";

afterAll(() => {
    jest.clearAllMocks();
});

describe("Check Confirmation page snapshot:", () => {
    it("matches the snapshot", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        const wrapper = render(
            <Router history={history}>
                <Confirmation />
            </Router>
        );
        
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Check form:", () => {
    it("'Yes, trigger Data delivery' is selectable and is the only one checked", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        userEvent.click(radioBtnForYes);

        expect(screen.getByLabelText("Yes, trigger Data Delivery")).toBeChecked();
        expect(screen.getByLabelText("No, do not trigger Data Delivery")).not.toBeChecked();
    });
    
    it("'No, do not trigger Data delivery' is selectable and is the only one checked", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const radioBtnForNo = screen.getByText("No, do not trigger Data Delivery");
        userEvent.click(radioBtnForNo);

        expect(screen.getByLabelText("Yes, trigger Data Delivery")).not.toBeChecked();
        expect(screen.getByLabelText("No, do not trigger Data Delivery")).toBeChecked();
    });

    it("redirects to the homepage with a success message when api is triggered successfully", async () => {
        mock.onPost("/api/trigger").reply(200, "completed");

        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForYes);
        userEvent.click(confirmBtn);
        await waitFor(() => 
        { 
            expect(history.location.pathname).toEqual("/");
        });
        expect(history.location.state).toEqual({ "status": "Triggered Data Delivery successfully, It may take a few minutes for the run to appear in the table below." });
    });

    it("redirects to the homepage with a failure message when api is triggered unsuccessfully", async () => {
        mock.onPost("/api/trigger").reply(200, "failed");

        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForYes);
        userEvent.click(confirmBtn);
        await waitFor(() => 
        { 
            expect(history.location.pathname).toEqual("/");
        });
        expect(history.location.state).toEqual({ "status": "Failed to trigger Data Delivery." });
    });

    it("navigates back to the homepage when 'No' is the selected form option and confirmed", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const radioBtnForNo = screen.getByText("No, do not trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForNo);
        userEvent.click(confirmBtn);
        
        expect(history.location.pathname).toEqual("/");
    });

    it("navigates back to the homepage when the 'Cancel' button is clicked", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <Confirmation />
                    </Route>
                </Switch>
            </Router>
        );
        
        const confirmBtn = screen.getByRole("button", { name: "Cancel" });
        userEvent.click(confirmBtn);
        
        expect(history.location.pathname).toEqual("/");
    });
});
