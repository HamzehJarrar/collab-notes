// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Google Font — Plus Jakarta Sans (clean modern sans-serif)
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
