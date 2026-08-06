import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import StatusMessage from "./statusMessage";

describe("StatusMessage", () => {
  it("renders nothing when status is blank", () => {
    const { container } = render(<StatusMessage status="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders success panel for success status", () => {
    render(<StatusMessage status="success: operation complete" />);

    expect(screen.getByText("success: operation complete")).toBeInTheDocument();
  });

  it("renders error panel for non-success status", () => {
    render(<StatusMessage status="unable to process" />);

    expect(screen.getByText("unable to process")).toBeInTheDocument();
  });
});
