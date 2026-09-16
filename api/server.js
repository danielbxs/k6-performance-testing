import express from "express";
import { createInitialData } from "./data.js";
import { findEvent, isValidEventId, errorResponse, isValidEmail } from "./utils.js";

const app = express();
const host = "127.0.0.1";
const port = 3000;

let store = createInitialData();

app.disable("x-powered-by");
app.use(express.json());
app.use((_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

app.get("/health", (_request, response) => {
  response
    .status(200)
    .json({
      status: "ok",
      service: "ticket-center",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
});

app.get("/events", (_request, response) => {
  response.status(200).json({ count: store.events.length, events: store.events });
});

app.get("/events/:id", (request, response) => {
  const eventId = request.params.id;

  if (!isValidEventId(eventId)) {
    return errorResponse(
      response,
      400,
      "INVALID_EVENT_ID",
      "Event ID must use the format evt-001.",
    );
  }

  const event = findEvent(store, eventId);

  if (!event) {
    return errorResponse(response, 404, "EVENT_NOT_FOUND", "Event not found.");
  }

  return response.status(200).json({ event });
});

app.post("/reservations", (request, response) => {
  const body = request.body;

  if (!body || Array.isArray(body) || typeof body !== "object") {
    return errorResponse(
      response,
      400,
      "INVALID_REQUEST_BODY",
      "Request body must be a JSON object.",
    );
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail =
    typeof body.customerEmail === "string"
      ? body.customerEmail.trim().toLowerCase()
      : "";
  const quantity = body.quantity;
  const validationErrors = [];

  if (!isValidEventId(eventId)) {
    validationErrors.push("eventId must use the format evt-001.");
  }

  if (customerName.length < 2 || customerName.length > 50) {
    validationErrors.push("customerName must contain between 2 and 50 characters.");
  }

  if (!isValidEmail(customerEmail) || customerEmail.length > 100) {
    validationErrors.push("customerEmail must be a valid email address.");
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    validationErrors.push("quantity must be an integer between 1 and 10.");
  }

  if (validationErrors.length) {
    return errorResponse(
      response,
      400,
      "VALIDATION_ERROR",
      "Reservation data is invalid.",
      validationErrors,
    );
  }

  const event = findEvent(store, eventId);

  if (!event) {
    return errorResponse(response, 404, "EVENT_NOT_FOUND", "Event not found.");
  }

  if (event.availableTickets < quantity) {
    return errorResponse(
      response,
      409,
      "INSUFFICIENT_TICKETS",
      "The requested number of tickets is not available.",
    );
  }

  const reservation = {
    id: `res-${String(store.nextReservationNumber).padStart(6, "0")}`,
    eventId: event.id,
    eventName: event.name,
    eventDate: event.date,
    customerName,
    customerEmail,
    quantity,
    totalPrice: Number((event.price * quantity).toFixed(2)),
    currency: event.currency,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  store.nextReservationNumber += 1;
  event.availableTickets -= quantity;
  store.reservations.push(reservation);

  return response.status(201).json({ reservation });
});

app.post("/test/reset", (_request, response) => {
  store = createInitialData();

  response
    .status(200)
    .json({
      status: "reset",
      eventCount: store.events.length,
      reservationCount: store.reservations.length,
    });
});

app.use((request, response) => {
  return errorResponse(
    response,
    404,
    "ROUTE_NOT_FOUND",
    `Route ${request.method} ${request.originalUrl} was not found.`,
  );
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return errorResponse(
      response,
      400,
      "INVALID_JSON",
      "Request body contains invalid JSON.",
    );
  }

  console.error(error);
  return errorResponse(
    response,
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred.",
  );
});

const server = app.listen(port, host, () => {
  console.log(`Ticket Center API listening at http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Closing Ticket Center API.`);

  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
