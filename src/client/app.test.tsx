import { act, cleanup, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import App from "./app";
import flushPromises from "./test-utils";
import { type DataDeliveryBatchData } from "../shared/types";

import MockDate from "mockdate";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("React homepage", () => {
  const batches: DataDeliveryBatchData[] = [
    {
      survey: "OPN",
      date: "2021-03-29T11:30:00.000Z",
      dateString: "29/03/2021 11:30:00",
      name: "OPN_29032021_113000",
    },
    {
      survey: "OPN",
      date: "2021-03-25T02:30:00.000Z",
      dateString: "25/03/2021 02:30:00",
      name: "OPN_25032021_023000",
    },
  ];

  beforeAll(() => {
    MockDate.set(new Date("2021-03-30T02:30:00.000Z"));
    mock.onGet("/api/batch").reply(200, batches);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
    MockDate.reset();
  });

  it("view instrument page matches Snapshot", async () => {
    const wrapper = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    const { getByText, queryByText, getAllByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(/Data Delivery Management/i)).toBeDefined();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText(/Data Delivery Management/i)).toBeDefined();
      expect(getByText(/29\/03\/2021 11:30:00/i)).toBeDefined();
      expect(getByText(/25\/03\/2021 02:30:00/i)).toBeDefined();
      expect(getAllByText(/View run status/i)).toBeDefined();
      expect(getByText(/Status/)).toBeDefined();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

describe("Given the API returns an empty list", () => {
  beforeAll(() => {
    mock.onGet("/api/batch").reply(200, []);
  });

  it("it should render with a message to inform the user in the list", async () => {
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(/No data delivery runs found./i)).toBeDefined();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given an unknown route", () => {
  it("shows a not found message with a link back to homepage", async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <MemoryRouter initialEntries={["/this-route-does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );

    expect(getByRole("heading", { name: /Page not found/i })).toBeInTheDocument();
    expect(getByText(/The page you're looking for doesn't exist./i)).toBeInTheDocument();

    const homeLink = getByRole("link", { name: /Return home/i });

    expect(homeLink).toHaveAttribute("href", "/");

    await user.click(homeLink);

    await waitFor(() => {
      expect(getByRole("heading", { name: /Data delivery runs/i })).toBeInTheDocument();
    });
  });
});
