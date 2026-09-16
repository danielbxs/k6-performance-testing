import { sleep } from "k6";
import {
  createNewReservation,
  readAllEvents,
  readSingleEvent,
  testSetup,
} from "./helpers/journeys.js";

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    checks: ["rate == 1"],
    http_req_failed: ["rate == 0"],
    http_req_duration: ["p(95) < 200"],
  },
};

export function setup() {
  testSetup();
}

export default function () {
  const events = readAllEvents();
  sleep(2);

  const event = readSingleEvent(events);
  sleep(1);

  createNewReservation(event);
  sleep(3);
}
