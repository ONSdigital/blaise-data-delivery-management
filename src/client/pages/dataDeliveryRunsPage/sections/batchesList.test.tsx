import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import {
  batches,
  deadBatchRuns,
  errorBatchRuns,
  errorBatchRunsWithErrorMessage,
  pendingBatchRuns,
  successBatchRuns,
} from "../../../features/step_definitions/fixtures.mock";

import BatchesList from "./batchesList";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import userEvent from "@testing-library/user-event";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

const testNow = new Date("2021-03-13T12:00:00.000Z");
let dateNowSpy: ReturnType<typeof vi.spyOn>;

function withBatchDate(batchName: string, date: Date) {
  const isoDate = date.toISOString();

  return {
    survey: "OPN",
    date: isoDate,
    dateString: isoDate,
    name: batchName,
  };
}

afterAll(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(testNow.valueOf());
});

afterEach(() => {
  dateNowSpy.mockRestore();
});

describe("Check BatchList component snapshot:", () => {
  beforeEach(() => {
    mock.onGet("/api/batch").reply(200, batches);
  });

  it("matches the snapshot", async () => {
    const wrapper = render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it("displays table headings including loader/spinner", async () => {
    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();
    expect(await screen.findByText(/Survey/)).toBeVisible();
    expect(await screen.findByText(/Data delivery run time/)).toBeVisible();
    expect(await screen.findByText(/Status/)).toBeVisible();

    const viewRunStatuses = await screen.findAllByText(/View run status/);

    for (let i = 0; i < viewRunStatuses.length; i++) {
      expect(viewRunStatuses[i]).toBeVisible();
    }

    expect(await screen.findAllByText(/View run status/)).toHaveLength(5);
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });
});

describe("Check status component color:", () => {
  it("displays a red circle when a batch entry has errored", async () => {
    mock.onGet("/api/batch").reply(200, [batches[0]]);
    mock.onGet("/api/batch/OPN_24032021_113000").reply(200, errorBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/OPN_24032021_113000-status-error/)).toBeDefined();
  });

  it("displays a red circle when an error message is present", async () => {
    mock.onGet("/api/batch").reply(200, [batches[0]]);
    mock.onGet("/api/batch/OPN_24032021_113000").reply(200, errorBatchRunsWithErrorMessage);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/OPN_24032021_113000-status-error/)).toBeDefined();
  });

  it("displays a grey circle when a batch entry is inactive", async () => {
    mock.onGet("/api/batch").reply(200, [batches[1]]);
    mock.onGet("/api/batch/OPN_12032021_023400").reply(200, deadBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/OPN_12032021_023400-status-dead/)).toBeDefined();
  });

  it("displays an amber circle when a batch entry is not in_arc, inactive, or errored", async () => {
    mock.onGet("/api/batch").reply(200, [batches[2]]);
    mock.onGet("/api/batch/LM_12032021_023398").reply(200, pendingBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/LM_12032021_023398-status-pending/)).toBeDefined();
  });

  it("displays a green circle when a batch entry is in_arc", async () => {
    mock.onGet("/api/batch").reply(200, [batches[3]]);
    mock.onGet("/api/batch/LM_12032021_876000").reply(200, successBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/LM_12032021_876000-status-success/)).toBeDefined();
  });
});

describe("Check reload and date fallback behaviour:", () => {
  beforeEach(() => {
    mock.reset();
  });

  it("reload button requests the batch list again", async () => {
    mock.onGet("/api/batch").reply(200, [batches[0]]);
    mock.onGet("/api/batch/OPN_24032021_113000").reply(200, successBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    await screen.findByTestId(/OPN_24032021_113000-status-success/);
    expect(mock.history.get.filter((request) => request.url === "/api/batch")).toHaveLength(1);

    const reloadButton = await screen.findByRole("button", { name: "Reload" });

    await userEvent.click(reloadButton);

    expect(mock.history.get.filter((request) => request.url === "/api/batch")).toHaveLength(2);
  });

  it("falls back to batch date when dateString is invalid", async () => {
    mock.onGet("/api/batch").reply(200, [
      {
        date: "2021-03-24T11:30:00.000Z",
        dateString: "not-a-date",
        name: "OPN_24032021_113000",
        survey: "OPN",
      },
    ]);
    mock.onGet("/api/batch/OPN_24032021_113000").reply(200, successBatchRuns);

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId(/OPN_24032021_113000-status-success/)).toBeDefined();
    expect(await screen.findByText(/not-a-date/)).toBeVisible();
  });

  it("queries every run from the last week and excludes older runs", async () => {
    const lastWeekBatches = Array.from({ length: 60 }, (_value, index) => {
      const recentDate = new Date(testNow);

      recentDate.setDate(recentDate.getDate() - (index % 7));

      return withBatchDate(`OPN_Recent_${index}`, recentDate);
    });

    const oldBatch = withBatchDate("OPN_TooOld", new Date("2021-03-01T00:00:00.000Z"));
    const responseBatches = [...lastWeekBatches, oldBatch];

    mock.onGet("/api/batch").reply(200, responseBatches);

    for (const batch of lastWeekBatches) {
      mock.onGet(`/api/batch/${batch.name}`).reply(200, successBatchRuns);
    }

    render(
      <MemoryRouter>
        <BatchesList />
      </MemoryRouter>,
    );

    expect(await screen.findAllByTestId("batches-table-row")).toHaveLength(lastWeekBatches.length);
    expect(screen.queryByTestId("OPN_TooOld-status-success")).not.toBeInTheDocument();
    expect(
      mock.history.get.filter((request) => request.url?.startsWith("/api/batch/")).length,
    ).toBe(lastWeekBatches.length);
  });
});
