import React from "react";
import { createRoot } from "react-dom/client";
import App from "./client/app";
import { BrowserRouter as Router } from "react-router-dom";

const container = document.getElementById("root");

if (!container) {
    throw new Error("Root container element not found");
}

const root = createRoot(container);

root.render(
    <React.StrictMode>
        <Router>
            <App/>
        </Router>
    </React.StrictMode>
);
