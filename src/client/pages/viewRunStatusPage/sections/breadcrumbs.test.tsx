import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";

import Breadcrumbs from "./breadcrumbs";

import userEvent from "@testing-library/user-event";

const mockRoute = "/batch/OPN_24032021_113000";

describe("Check breadcrumbs:", () => {
  it("navigates to the homepage when the breadcrumb is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[mockRoute]}>
        <Routes>
          <Route
            path="/batch/:batchName"
            element={<Breadcrumbs />}
          />
          <Route
            path="/"
            element={<h1>Home Page</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: "Home" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Home Page" })).toBeInTheDocument();
    });
  });

  it("renders nav with a Home link", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
