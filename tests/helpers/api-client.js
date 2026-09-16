import http from "k6/http";

const baseUrl = "http://127.0.0.1:3000";

export function getHealth() {
  return http.get(`${baseUrl}/health`, { tags: { name: "GET /health" } });
}

export function getEvents() {
  return http.get(`${baseUrl}/events`, { tags: { name: "GET /events" } });
}

export function getEvent(eventId) {
  return http.get(`${baseUrl}/events/${eventId}`, {
    tags: { name: "GET /events/:id" },
  });
}

export function createReservation(payload) {
  return http.post(`${baseUrl}/reservations`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    tags: { name: "POST /reservations" },
  });
}

export function resetTestData() {
  return http.post(`${baseUrl}/test/reset`, null, {
    tags: { name: "POST /test/reset" },
  });
}
