/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { Switch, Route, Router } from "react-router-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { createMemoryHistory } from "history";
import BatchStatusList from "./batchStatusList";
import { statusDescriptions } from "./__mocks__/mock_objects";
import userEvent from "@testing-library/user-event";

const mockRoute = "/batch/OPN_24032021_113000";

describe("Check breadcrumbs:", () => {
    it("navigates to the homepage when the breadcrumb is clicked", async () => {
        const history = createMemoryHistory({
            initialEntries: [mockRoute]
        });
        render(
            <Router history={history}>
                <Switch>
                    <Route path={mockRoute}>
                        <BatchStatusList statusDescriptionList={statusDescriptions} />
                    </Route>
                </Switch>
            </Router>
        );
    
        const homeLink = screen.getByText("Home");
        userEvent.click(homeLink);
        expect(history.location.pathname).toEqual("/");
    });
});
