/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Confirmation from "./Confirmation";
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
        const wrapper = render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Check form:", () => {
    it("'Yes, trigger Data delivery' is selectable and is the only one checked", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );
        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        userEvent.click(radioBtnForYes);

        expect(screen.getByLabelText("Yes, trigger Data Delivery")).toBeChecked();
        expect(screen.getByLabelText("No, do not trigger Data Delivery")).not.toBeChecked();
    });

    it("'No, do not trigger Data delivery' is selectable and is the only one checked", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        const radioBtnForNo = screen.getByText("No, do not trigger Data Delivery");
        userEvent.click(radioBtnForNo);

        expect(screen.getByLabelText("Yes, trigger Data Delivery")).not.toBeChecked();
        expect(screen.getByLabelText("No, do not trigger Data Delivery")).toBeChecked();
    });

    it("redirects to the homepage with a success message when api is triggered successfully", async () => {
        mock.onPost("/api/trigger").reply(200, "completed");

        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                    <Route path="/" element={<div>Homepage</div>} />
                </Routes>
            </MemoryRouter>
        );

        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForYes);
        userEvent.click(confirmBtn);

        await waitFor(() =>
            expect(screen.getByText("Homepage")).toBeInTheDocument()
        );
    });

    it("redirects to the homepage with a failure message when api is triggered unsuccessfully", async () => {
        mock.onPost("/api/trigger").reply(200, "failed");

        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                    <Route path="/" element={<div>Homepage</div>} />
                </Routes>
            </MemoryRouter>
        );

        const radioBtnForYes = screen.getByText("Yes, trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForYes);
        userEvent.click(confirmBtn);

        await waitFor(() =>
            expect(screen.getByText("Homepage")).toBeInTheDocument()
        );
    });

    it("navigates back to the homepage when 'No' is the selected form option and confirmed", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                    <Route path="/" element={<div>Homepage</div>} />
                </Routes>
            </MemoryRouter>
        );

        const radioBtnForNo = screen.getByText("No, do not trigger Data Delivery");
        const confirmBtn = screen.getByRole("button", { name: "Continue" });
        userEvent.click(radioBtnForNo);
        userEvent.click(confirmBtn);

        await waitFor(() =>
            expect(screen.getByText("Homepage")).toBeInTheDocument()
        );
    });

    it("navigates back to the homepage when the 'Cancel' button is clicked", async () => {
        render(
            <MemoryRouter initialEntries={[mockRoute]}>
                <Routes>
                    <Route path={mockRoute} element={<Confirmation />} />
                    <Route path="/" element={<div>Homepage</div>} />
                </Routes>
            </MemoryRouter>
        );

        const confirmBtn = screen.getByRole("button", { name: "Cancel" });
        userEvent.click(confirmBtn);

        await waitFor(() =>
            expect(screen.getByText("Homepage")).toBeInTheDocument()
        );
    });
});
