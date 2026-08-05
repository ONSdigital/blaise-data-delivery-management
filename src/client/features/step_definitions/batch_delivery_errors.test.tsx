import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import MockDate from "mockdate";

import App from "../../app";
import "@testing-library/jest-dom";
import flushPromises from "../../test-utils";
import { batchList } from "./fixtures.mock";
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

describe("Feature: Handle errors when viewing runs and run statuses", () => {
  scenario("Listing recent data delivery runs fails", ({ Given, When, Then }) => {
    Given("I have opened Data Delivery Management", () => {
      mock.onGet("/api/batch/OPN_26032021_112954").reply(500, {});
      mock.onGet("/api/batch").reply(500, {});
      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    When("I view the landing page and the run list fails to load", async () => {
      await act(async () => {
        await flushPromises();
      });
    });

    Then("I am shown a message that there is a problem", () => {
      expect(screen.getByText(/Data delivery runs/i)).toBeDefined();
      expect(screen.getByText(/Unable to load data delivery run list/i)).toBeDefined();
    });
  });

  scenario("View run status fails", ({ Given, When, Then }) => {
    Given("I can see the run I want to view", async () => {
      mock.onGet("/api/batch/OPN_26032021_112954").reply(500, {});
      mock.onGet("/api/batch").reply(200, batchList);
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

    Then("I am shown a message that there is a problem", () => {
      expect(screen.getByText(/Data delivery run for/i));
      expect(screen.getByText(/26\/03\/2021 11:29/i)).toBeDefined();
      expect(screen.getByText(/Unable to load batch info/i)).toBeDefined();
    });
  });
});
