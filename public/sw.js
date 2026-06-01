/* Avori OS service worker — Web Push + notification handling.
 *
 * This is what lets the app notify you even when it's fully closed
 * (on iOS, the app must be added to the Home Screen first). The server
 * sends an encrypted push; this worker wakes up and shows it.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Avori OS", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Avori OS";
  const options = {
    body: data.body || "",
    icon: data.icon || "/apple-icon",
    badge: data.badge || "/apple-icon",
    tag: data.tag || "avori",
    renotify: true,
    vibrate: [60, 40, 60],
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if ("focus" in client) {
          try {
            await client.navigate(target);
          } catch {
            /* navigation may fail cross-origin; focus anyway */
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })()
  );
});
