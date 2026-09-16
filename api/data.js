const SEED_EVENTS = [
  {
    id: 'evt-001',
    name: 'QA Engineering Conference',
    date: '2027-03-18T12:00:00.000Z',
    venue: 'Javits Center',
    city: 'New York',
    country: 'United States',
    category: 'conference',
    price: 249.9,
    currency: 'USD',
    availableTickets: 10000,
  },
  {
    id: 'evt-002',
    name: 'Test Automation Workshop',
    date: '2027-04-10T13:00:00.000Z',
    venue: 'Business Design Centre',
    city: 'London',
    country: 'United Kingdom',
    category: 'workshop',
    price: 149.9,
    currency: 'GBP',
    availableTickets: 7500,
  },
  {
    id: 'evt-003',
    name: 'Web Performance Meetup',
    date: '2027-05-22T18:30:00.000Z',
    venue: 'CityCube Berlin',
    city: 'Berlin',
    country: 'Germany',
    category: 'meetup',
    price: 79.9,
    currency: 'EUR',
    availableTickets: 5000,
  },
  {
    id: 'evt-004',
    name: 'Software Quality Summit',
    date: '2027-06-14T12:30:00.000Z',
    venue: 'Suntec Convention Centre',
    city: 'Singapore',
    country: 'Singapore',
    category: 'conference',
    price: 199.9,
    currency: 'SGD',
    availableTickets: 8500,
  },
];

export function createInitialData() {
  return {
    events: SEED_EVENTS.map((event) => ({ ...event })),
    reservations: [],
    nextReservationNumber: 1,
  };
}
