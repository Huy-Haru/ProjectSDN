const express = require('express');
const healthController = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const trainerRoutes = require('./trainer');
const bookingsRoutes = require('./bookings');
const progressRoutes = require('./progress');
const reviewsRoutes = require('./reviews');
const subscriptionRoutes = require('./subscription');
const memberBookingRoutes = require('./memberBookings');

const router = express.Router();
router.get('/health', asyncHandler(healthController.getHealth));

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

// Profile routes: /api/profile/*
router.use('/profile', profileRoutes);

// Trainer routes: /api/trainer/*
router.use('/trainer', trainerRoutes);
router.use('/admin', require('./admin'));
router.use('/member', require('./member'));

// ProgressLog: /api/progress/*  (A3.1)
router.use('/progress', progressRoutes);

// Reviews: /api/reviews/*  (A3.2)
router.use('/reviews', reviewsRoutes);

// Subscription routes: /api/subscriptions/*
router.use('/subscriptions', subscriptionRoutes);

// Booking result/detail routes are mounted first. The detail route is limited
// to ObjectId-shaped params so member paths such as /my remain available.
router.use('/bookings', bookingsRoutes);
// Member booking create/list/cancel routes. Kept separate from booking result/detail routes.
router.use('/bookings', memberBookingRoutes);

module.exports = router;

