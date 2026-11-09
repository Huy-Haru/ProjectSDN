// Compatibility facade for legacy imports. The canonical member booking
// implementation lives in memberBookingService.
const memberBookingService = require('./memberBookingService');

async function createBooking({ memberId, trainerId, subscriptionId, date, startTime, note }) {
  const booking = await memberBookingService.create(memberId, { trainerId, subscriptionId, date, startTime, note });
  return { booking };
}

const getBookingById = (memberId, bookingId) => memberBookingService.getById(memberId, bookingId);
const getMyBookings = (memberId, filters) => memberBookingService.bookings(memberId, filters);
const cancelBooking = ({ memberId, bookingId, reason }) => memberBookingService.cancel(memberId, bookingId, reason);

module.exports = { createBooking, getBookingById, getMyBookings, cancelBooking };
