import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const rootElement = document.getElementById("root");

// Si le HTML a été pré-rendu (react-snap-like), on hydrate au lieu de re-render à vide.
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
