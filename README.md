[![Performance Tests](https://github.com/danielbxs/k6-performance-testing/actions/workflows/performance-tests.yml/badge.svg)](https://github.com/danielbxs/k6-performance-testing/actions/workflows/performance-tests.yml)

# Ticket Center API Performance Testing with k6

This project demonstrates performance tests of a locally hosted ticket-reservation API using the k6 framework. It covers the main user journeys of listing all events, viewing one event, and creating a reservation under smoke, load, stress, and spike workloads.

Ticket Center is a small Node.js API created as a controlled test target. The project focuses on reusable k6 tests, functional checks, performance thresholds, and automated smoke and load tests with GitHub Actions.

## API endpoints

| Method | Endpoint        | Input                                                                      | Successful response                                                |
| ------ | --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `GET`  | `/health`       | None                                                                       | `200` with the service status, name, timestamp, and uptime         |
| `GET`  | `/events`       | None                                                                       | `200` with the event count and event list                          |
| `GET`  | `/events/:id`   | Event ID in the URL, e.g., `evt-001`                                       | `200` with the matching event                                      |
| `POST` | `/reservations` | JSON containing `eventId`, `customerName`, `customerEmail`, and `quantity` | `201` with the created reservation                                 |
| `POST` | `/test/reset`   | None                                                                       | `200` after restoring the initial events and clearing reservations |

Invalid requests return an appropriate `400`, `404`, or `409` response. The `/test/reset` endpoint exists only to restore predictable data before a performance-test run.

---

## Technologies used

| Technology                                                            | Purpose                       |
| --------------------------------------------------------------------- | ----------------------------- |
| [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | API and test implementation   |
| [Node.js 24](https://nodejs.org/)                                     | API runtime                   |
| [Express](https://expressjs.com/)                                     | Ticket Center REST API        |
| [Grafana k6](https://grafana.com/docs/k6/latest/)                     | Performance testing framework |
| [GitHub Actions](https://github.com/features/actions)                 | Smoke and load tests in CI    |

---

## Test types

| Type   | Purpose                                       | Workload                                      | Execution    |
| ------ | --------------------------------------------- | --------------------------------------------- | ------------ |
| Smoke  | Verify the API stability and the test journey | 1 VU, 5 iterations                            | Local and CI |
| Load   | Evaluate normal expected traffic              | Ramp to 50 VUs, hold for 2 minutes, ramp down | Local and CI |
| Stress | Observe behavior under increasing load        | Holds at 25, 50, and 100 VUs                  | Local        |
| Spike  | Observe sudden traffic increase and recovery  | Jump from 5 to 250 VUs, then return to 5      | Local        |

---

## Results

> **100% checks passed · 0% HTTP failures · 250 peak VUs · all thresholds passed**

| Test Type | Peak VUs | Requests |  Throughput |    p(95) | Result |
| --------- | -------: | -------: | ----------: | -------: | ------ |
| Smoke     |        1 |       17 |  0.57 req/s | 13.73 ms | Passed |
| Load      |       50 |    3,827 | 20.96 req/s |  1.21 ms | Passed |
| Stress    |      100 |    6,896 | 28.28 req/s |  1.19 ms | Passed |
| Spike     |      250 |    3,584 | 36.74 req/s |  1.08 ms | Passed |

The API remained functional across all four profiles. No degradation or increase in errors was observed through 100 VUs, and the API remained healthy after the 250-VU spike.

These results were collected with the API and k6 running on the same local computer. They demonstrate behavior in this test environment and are not production-capacity claims.

---

## Local setup

### Prerequisites

Ensure you have the following installed:

- [Git](https://git-scm.com/downloads)
- [Node.js 24](https://nodejs.org/en/download)
- [Grafana k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

### Clone the repository:

```bash
git clone https://github.com/danielbxs/k6-performance-testing.git k6-performance-tests
cd k6-performance-tests
```

### Install the API dependencies

```bash
npm ci --prefix api
```

### Start the Ticket Center API in the first terminal:

```bash
npm run api
```

> The API runs at `http://127.0.0.1:3000`. Verify it by opening `http://127.0.0.1:3000/health` or requesting it from another terminal:

```bash
curl http://127.0.0.1:3000/health
```

## Running the tests

Keep the API running and execute a profile from a second terminal:

### Smoke test

```bash
npm run smoke
```

### Load test

```bash
npm run load
```

### Stress test

```bash
npm run stress
```

### Spike test

```bash
npm run spike
```

Each test checks API health and resets the in-memory test data once before the iterations begin.

---

## Note about CI/CD

The [GitHub Actions workflow](.github/workflows/performance-tests.yml) runs smoke and load tests on pushes and pull requests to `main`. The k6 JSON summaries are uploaded as workflow artifacts even when a threshold fails.

Stress and spike tests run locally because their heavier workloads require a controlled environment, unlike variable GitHub-hosted runners.
