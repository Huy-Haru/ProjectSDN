const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', authenticate, authorize(ROLES.MEMBER), asyncHandler(bookingController.createBooking));
router.get('/', authenticate, authorize(ROLES.MEMBER), asyncHandler(bookingController.getMyBookings));
router.get('/my', authenticate, authorize(ROLES.MEMBER), asyncHandler(bookingController.getMyBookings));
router.patch('/:id/cancel', authenticate, authorize(ROLES.MEMBER), asyncHandler(bookingController.cancelBooking));

module.exports = router;
