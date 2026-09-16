export function errorResponse(
  response,
  status,
  code,
  message,
  details,
) {
  const body = { error: { code, message } };

  if (details?.length) {
    body.error.details = details;
  }

  return response.status(status).json(body);
}

export function isValidEventId(eventId) {
  return /^evt-\d{3}$/.test(eventId);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function findEvent(store, eventId) {
  return store.events.find((event) => event.id === eventId);
}
