import { sleep } from "k6";
import {
  createNewReservation,
  readAllEvents,
  readSingleEvent,
  testSetup,
} from "./helpers/journeys.js";

export const options = {
  stages: [
    { duration: "30s", target: 25 },
    { duration: "30s", target: 25 },

    { duration: "30s", target: 50 },
    { duration: "30s", target: 50 },

    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },

    { duration: "30s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.95"],
    http_req_failed: ["rate < 0.05"],
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
