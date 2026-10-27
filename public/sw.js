self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, tag } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: icon || "/logo.svg",
      tag: tag || "notification",
      requireInteraction: false,
      silent: false,
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = new URL("/notifications", self.location.origin);
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existingClient = windowClients.find(
          (client) => client.url.includes("/notifications") && "focus" in client
        );
        if (existingClient) {
          return existingClient.focus();
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
