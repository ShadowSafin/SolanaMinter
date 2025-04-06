import "./polyfills"; // Import polyfills first
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { SpeedInsights } from "@vercel/speed-insights/react"; // <-- Add this import

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SpeedInsights /> {/* <-- Add this line */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);