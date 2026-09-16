import { fail } from "k6";
import {
  randomItem,
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import {
  apiHealthStatusCheck,
  emptyArrayCheck,
  eventIdMatchCheck,
  reservationCheck,
  reservationEventIdCheck,
  reservationIdCheck,
  validJSONCheck,
  validObjectCheck,
  validResetCheck,
  validStatusCheck,
} from "./checks.js";
import {
  eventItemLabel,
  eventListLabel,
  healthLabel,
  reservationLabel,
  resetLabel,
} from "./constants.js";
import {
  createReservation,
  getEvent,
  getEvents,
  getHealth,
  resetTestData,
} from "./api-client.js";

export function testSetup() {
  const healthResponse = getHealth();

  const validHealthStatus = validStatusCheck(healthResponse, 200, healthLabel);
  if (!validHealthStatus) fail(`${healthLabel}: status code is not 200`);

  const validHealthJSON = validJSONCheck(healthResponse, healthLabel);
  if (!validHealthJSON) fail(`${healthLabel}: response is not valid JSON`);

  const health = healthResponse.json();

  const validApiHealth = apiHealthStatusCheck(health, healthLabel);
  if (!validApiHealth) fail(`${healthLabel} status is not ok`);

  const resetResponse = resetTestData();

  const validResetStatus = validStatusCheck(resetResponse, 200, resetLabel);
  if (!validResetStatus) fail(`${resetLabel}: status code is not 200`);

  const validResetJSON = validJSONCheck(resetResponse, resetLabel);
  if (!validResetJSON) fail(`${resetLabel}: response is not valid JSON`);

  const reset = resetResponse.json();

  const validReset = validResetCheck(reset, resetLabel);
  if (!validReset) fail(`${resetLabel}: test data was not reset correctly`);
}

export function readAllEvents() {
  const eventListResponse = getEvents();

  const validEventListStatus = validStatusCheck(
    eventListResponse,
    200,
    eventListLabel,
  );
  const validEventList = validJSONCheck(eventListResponse, eventListLabel);

  if (!validEventListStatus || !validEventList) {
    fail("Events response is not valid");
  }

  const events = eventListResponse.json()?.events;
  const emptyCheck = emptyArrayCheck(events, eventListLabel);
  if (!emptyCheck) fail("Events response is empty");

  return events;
}

export function readSingleEvent(events) {
  const event = randomItem(events);

  const eventItemResponse = getEvent(event.id);
  const validEventItemStatus = validStatusCheck(
    eventItemResponse,
    200,
    eventItemLabel,
  );
  const validEventItemJSON = validJSONCheck(eventItemResponse, eventItemLabel);
  if (!validEventItemStatus || !validEventItemJSON) {
    fail("event item response is not valid");
  }

  const eventItem = eventItemResponse.json()?.event;

  const validEventItemObject = validObjectCheck(eventItem, eventItemLabel);
  if (!validEventItemObject) fail("event item is not a valid object");

  const validEventItemId = eventIdMatchCheck(eventItem, event.id, eventItemLabel);
  if (!validEventItemId) fail("event item contains an invalid id");

  return eventItem;
}

export function createNewReservation(eventItem) {
  const name = `${randomString(randomIntBetween(2, 10))} ${randomString(randomIntBetween(2, 10))}`;
  const email = `${randomString(randomIntBetween(2, 10))}@test.com`;

  const reservationBody = {
    eventId: eventItem.id,
    customerName: name,
    customerEmail: email,
    quantity: randomIntBetween(1, 10),
  };

  const createReservationResponse = createReservation(reservationBody);

  const validReservationStatus = validStatusCheck(
    createReservationResponse,
    201,
    reservationLabel,
  );
  const validReservationJSON = validJSONCheck(
    createReservationResponse,
    reservationLabel,
  );
  if (!validReservationStatus || !validReservationJSON) {
    fail("reservation response is not valid");
  }

  const reservationItem = createReservationResponse.json()?.reservation;
  const validReservationObject = validObjectCheck(reservationItem, reservationLabel);
  if (!validReservationObject) {
    fail("reservation item is not a valid object");
  }

  const validReservationId = reservationIdCheck(reservationItem, reservationLabel);
  if (!validReservationId) fail("reservation id is not valid");

  const validEventIdInReservation = reservationEventIdCheck(
    reservationItem,
    eventItem.id,
    reservationLabel,
  );
  if (!validEventIdInReservation) {
    fail("reservation item has invalid event id");
  }

  const validReservation = reservationCheck(
    reservationItem,
    reservationBody,
    eventItem,
    reservationLabel,
  );

  if (!validReservation) fail("reservation item is not valid");
}
