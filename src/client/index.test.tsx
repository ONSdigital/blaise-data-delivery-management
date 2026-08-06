const { createRootMock, renderMock } = vi.hoisted(() => ({
  createRootMock: vi.fn(),
  renderMock: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("./app", () => ({
  default: () => <div>App</div>,
}));

describe("client entrypoint", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
    renderMock.mockClear();
    createRootMock.mockClear();
    createRootMock.mockReturnValue({
      render: renderMock,
    });
  });

  it("creates and renders the app when root container exists", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./index");

    const rootElement = document.getElementById("root");

    expect(createRootMock).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the root container is missing", async () => {
    await expect(import("./index")).rejects.toThrow("Root container element not found");
  });
});
