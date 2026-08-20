import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "../app/globals.css";
import { StatsLibrary } from "../app/stats-library";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatsLibrary />
  </StrictMode>,
);
