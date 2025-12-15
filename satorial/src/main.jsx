import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext"; // Ensure correct import
import { ClientProvider } from "./contexts/ClientContext";
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ClientProvider>
      <Analytics />
      <App />
    </ClientProvider>
  </AuthProvider>
);
