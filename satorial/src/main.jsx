import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext"; // Ensure correct import
import { ClientProvider } from "./contexts/ClientContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ClientProvider>
      <App />
    </ClientProvider>
  </AuthProvider>
);
