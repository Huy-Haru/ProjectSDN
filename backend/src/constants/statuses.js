const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid'
};

const BOOKING_STATUS = {
  BOOKED: 'booked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

module.exports = {
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  BOOKING_STATUS
};
