import { check } from "k6";

export function apiHealthStatusCheck(response, label) {
  return check(response, {
    [`${label}: is up and running`]: (r) => r.status === "ok",
  });
}

export function validStatusCheck(response, statusCode, label) {
  return check(response, {
    [`${label}: status is ${statusCode}`]: (r) => r.status === statusCode,
  });
}

export function validJSONCheck(response, label) {
  return check(response, {
    [`${label}: body is valid JSON`]: (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  });
}

export function emptyArrayCheck(arr, label) {
  return check(arr, {
    [`${label}: array is not empty`]: (r) => Array.isArray(r) && r.length > 0,
  });
}

export function validObjectCheck(obj, label) {
  return check(obj, {
    [`${label} is a valid object`]: (r) =>
      r !== null && typeof r === "object" && !Array.isArray(r),
  });
}

export function eventIdMatchCheck(event, id, label) {
  return check(event, {
    [`${label}: id matches selected event`]: (r) => r.id === id,
  });
}

export function reservationIdCheck(reservation, label) {
  return check(reservation, {
    [`${label}: id has the correct format`]: (r) =>
      typeof r.id === "string" && r.id.startsWith("res-"),
  });
}

export function reservationEventIdCheck(reservation, eventId, label) {
  return check(reservation, {
    [`${label}: has correct event id`]: (r) => r.eventId === eventId,
  });
}

export function reservationCheck(reservation, reservationBody, eventItem, label) {
  return check(reservation, {
    [`${label}: quantity is correct`]: (r) =>
      r.quantity === reservationBody.quantity,
    [`${label}: confirmation status is confirmed`]: (r) => r.status === "confirmed",
    [`${label}: currency is valid`]: (r) => r.currency === eventItem.currency,
    [`${label}: total price is valid`]: (r) =>
      r.totalPrice ===
      Number((eventItem.price * reservationBody.quantity).toFixed(2)),
  });
}

export function validResetCheck(response, label) {
  return check(response, {
    [`${label}: data was reset`]: (r) => r.status === "reset",
    [`${label}: reservation count was reset to 0`]: (r) => r.reservationCount === 0,
    [`${label}: event count is valid`]: (r) =>
      Number.isInteger(r.eventCount) && r.eventCount > 0,
  });
}
