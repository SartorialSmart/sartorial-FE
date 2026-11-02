import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <SubscriptionProvider>
      <ClientProvider>
        <NotificationProvider>
        <Analytics />
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
        </NotificationProvider>
      </ClientProvider>
    </SubscriptionProvider>
  </AuthProvider>
);
