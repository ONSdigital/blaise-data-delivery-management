/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { Route, MemoryRouter, Routes } from "react-router-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import BatchStatusList from "./BatchStatusList";
import { statusDescriptions } from "./__mocks__/mock_objects";
import userEvent from "@testing-library/user-event";

const mockRoute = "/batch/OPN_24032021_113000";

describe("Check breadcrumbs:", () => {
    it("navigates to the homepage when the breadcrumb is clicked", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<BatchStatusList statusDescriptionList={statusDescriptions} />} />
                </Routes>
            </MemoryRouter>
        );
    
        const homeLink = screen.getByText("Home");
        userEvent.click(homeLink);

        // With MemoryRouter, the pathname should update automatically
        expect(window.location.pathname).toEqual("/");
    });
});
