import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import MockDate from "mockdate";

import App from "../../app";
import "@testing-library/jest-dom";
import flushPromises from "../../test-utils";
import { batchInfoList, batchList, statusDescriptions } from "./fixtures.mock";
import { createScenario } from "../feature_scenario_runner";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const scenario = createScenario();

beforeAll(() => {
  MockDate.set(new Date("2021-03-27T02:30:00.000Z"));
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  vi.resetModules();
});

afterAll(() => {
  MockDate.reset();
});

describe("Feature: View data delivery runs and run statuses", () => {
  scenario("List all recent data delivery runs", ({ Given, When, Then }) => {
    Given("I have opened Data Delivery Management", () => {
      mock.onGet("/api/batch/OPN_26032021_112954").reply(200, batchInfoList);
      mock.onGet("/api/batch").reply(200, batchList);
      mock.onGet("/api/state/descriptions").reply(200, statusDescriptions);
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    When("I view the landing page", async () => {
      await act(async () => {
        await flushPromises();
      });
    });

    Then("I am shown a list of recent data delivery runs", () => {
      expect(screen.getByRole("heading", { name: /Data delivery runs/i })).toBeDefined();
      expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();
      expect(screen.getByText(/25\/03\/2021 14:58:38/i)).toBeDefined();
      expect(screen.getByText(/24\/03\/2021 16:50:33/i)).toBeDefined();
    });

    Then("the most recent run is shown first", () => {
      const list = screen.queryAllByTestId(/batches-table-row/i);
      const listItemOne = list[0];
      const firstRowData = listItemOne.childNodes[1];

      if (firstRowData !== null) {
        expect(firstRowData.textContent).toEqual("26/03/2021 11:29:54");
      }

      const listItemTwo = list[1];
      const secondRowData = listItemTwo.childNodes[1];

      if (secondRowData !== null) {
        expect(secondRowData.textContent).toEqual("25/03/2021 14:58:38");
      }

      const listItemThree = list[2];
      const thirdRowData = listItemThree.childNodes[1];

      if (thirdRowData !== null) {
        expect(thirdRowData.textContent).toEqual("24/03/2021 16:50:33");
      }
    });
  });

  scenario("View run status", ({ Given, When, Then }) => {
    Given("I can see the run I want to view", async () => {
      mock.onGet("/api/batch/OPN_26032021_112954").reply(200, batchInfoList);
      mock.onGet("/api/batch").reply(200, batchList);
      mock.onGet("/api/state/descriptions").reply(200, statusDescriptions);
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
      await act(async () => {
        await flushPromises();
      });
      expect(screen.getByRole("heading", { name: /Data delivery runs/i })).toBeDefined();
      expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();
    });

    When("I select the 'View run status' link", async () => {
      await act(async () => {
        fireEvent.click(screen.getByTestId(/view-OPN_26032021_112954/));
        await flushPromises();
      });
    });

    Then("I am shown a list of surveys processed in that run", () => {
      expect(screen.getByText(/Data delivery run for/i));
      expect(screen.getByText(/26\/03\/2021 11:29/i)).toBeDefined();
      expect(screen.getByText(/OPN2101A/i)).toBeDefined();
      expect(screen.getByText(/OPN2004A/i)).toBeDefined();
    });

    Then("the status information is displayed", () => {
      const list = screen.queryAllByTestId(/batch-table-row/i);
      const listItemOne = list[0];
      const firstRowData = listItemOne.childNodes;

      if (firstRowData !== null) {
        expect(firstRowData[0].textContent).toEqual("OPN2004A");
        expect(firstRowData[1].textContent).toEqual(
          "The data delivery instrument has no active survey days, we will not generate a data delivery file, we should never alert",
        );
      }

      const listItemTwo = list[1];
      const secondRowData = listItemTwo.childNodes;

      if (secondRowData !== null) {
        expect(secondRowData[0].textContent).toEqual("OPN2101A");
        expect(secondRowData[1].textContent).toEqual(
          "The data delivery process has generated the required files",
        );
      }

      const listItemThree = list[2];
      const thirdRowData = listItemThree.childNodes;

      if (thirdRowData !== null) {
        expect(thirdRowData[0].textContent).toEqual("OPN2106A");
        expect(thirdRowData[1].textContent).toEqual("Some error_info was here and that");
      }
    });
  });

  scenario("No recent data delivery runs found", ({ Given, When, Then }) => {
    Given("I have opened Data Delivery Management", () => {
      mock.onGet("/api/batch").reply(200, []);
      mock.onGet("/api/state/descriptions").reply(200, statusDescriptions);
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    When("I view the landing page", async () => {
      await act(async () => {
        await flushPromises();
      });
    });

    Then("I am shown a message that no runs were found", () => {
      expect(screen.getByRole("heading", { name: /Data delivery runs/i })).toBeDefined();
      expect(screen.getByText(/No data delivery runs found./i)).toBeDefined();
    });
  });

  scenario("No files found in run", ({ Given, When, Then }) => {
    Given("I can see the run I want to view", async () => {
      mock.onGet("/api/batch").reply(200, batchList);
      mock.onGet("/api/batch/OPN_26032021_112954").reply(200, []);
      mock.onGet("/api/state/descriptions").reply(200, statusDescriptions);
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    When("I view the landing page", async () => {
      await act(async () => {
        await flushPromises();
      });
    });

    Then("I am shown a list of runs", () => {
      expect(screen.getByRole("heading", { name: /Data delivery runs/i })).toBeDefined();
      expect(screen.getByText(/26\/03\/2021 11:29:54/i)).toBeDefined();
      expect(screen.getByText(/25\/03\/2021 14:58:38/i)).toBeDefined();
      expect(screen.getByText(/24\/03\/2021 16:50:33/i)).toBeDefined();
    });

    When("I select the 'View run status' link", async () => {
      await act(async () => {
        fireEvent.click(screen.getByTestId(/view-OPN_26032021_112954/));
        await flushPromises();
      });
    });

    Then("I am shown a message that no files were found", () => {
      expect(screen.getByText(/Data delivery run for/i));
      expect(screen.getByText(/No data delivery files for this run found./i)).toBeDefined();
    });
  });
});
