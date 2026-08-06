import { DefaultErrorBoundary, Footer, Header } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { Link, Route, Routes } from "react-router-dom";

import DataDeliveryRunsPage from "./pages/dataDeliveryRunsPage/dataDeliveryRunsPage";
import ViewRunStatusPage from "./pages/viewRunStatusPage/viewRunStatusPage";
import { useLocationState } from "./utils/useLocationState";

function NotFoundPage(): ReactElement {
  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Page not found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}

function App(): ReactElement {
  const { status } = useLocationState<{ status: string }>() ?? { status: "" };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header title={"Data Delivery Management"} />
      <div
        style={{ flexGrow: 1 }}
        className="ons-page__container ons-container"
      >
        <DefaultErrorBoundary>
          <Routes>
            <Route
              path="/batch/:batchName"
              element={<ViewRunStatusPage />}
            />
            <Route
              path="/"
              element={<DataDeliveryRunsPage status={status} />}
            />
            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </DefaultErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}

export default App;
