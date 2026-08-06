import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { statusDescriptions } from "../../features/step_definitions/fixtures.mock";

import ViewRunStatusPage from "./viewRunStatusPage";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const batch = {
  survey: "OPN",
  date: "2021-03-24T11:30:00.000Z",
  dateString: "24/03/2021 11:30:00",
  name: "OPN_24032021_113000",
};

const batchRuns = [
  {
    batch: batch.name,
    dd_filename: "OPN2004A__26032021_121540.zip",
    instrumentName: "OPN2004A",
    state: "in_arc",
    updated_at: "2021-03-24T12:21:10+00:00",
    error_info: "",
  },
];

beforeAll(() => {
  mock.onGet(`/api/batch/${batch.name}`).reply(200, batchRuns);
  mock.onGet("/api/state/descriptions").reply(200, statusDescriptions);
});

afterAll(() => {
  vi.clearAllMocks();
});

describe("ViewRunStatusPage", () => {
  it("displays page structure and batch details from the route", async () => {
    render(
      <MemoryRouter initialEntries={[`/batch/${batch.name}`]}>
        <Routes>
          <Route
            path="/batch/:batchName"
            element={<ViewRunStatusPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeVisible();
    expect(
      await screen.findByText("Data delivery run for OPN at 24/03/2021 11:30:00"),
    ).toBeVisible();
    expect(await screen.findByText(/Questionnaire/)).toBeVisible();
  });

  it("uses route state when available", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `/batch/${batch.name}`,
            state: { batch },
          },
        ]}
      >
        <Routes>
          <Route
            path="/batch/:batchName"
            element={<ViewRunStatusPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Data delivery run for OPN at 24/03/2021 11:30:00"),
    ).toBeVisible();
  });

  it("shows an invalid batch message when the route param cannot be parsed", async () => {
    render(
      <MemoryRouter initialEntries={["/batch/not-a-valid-batch"]}>
        <Routes>
          <Route
            path="/batch/:batchName"
            element={<ViewRunStatusPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Invalid batch name format:/)).toBeVisible();
  });
});
