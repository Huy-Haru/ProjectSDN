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
const bookingRoutes = require('./booking');

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

// Member booking routes are mounted first so /my and /:id/cancel are resolved
// before the generic booking result/detail routes.
router.use('/bookings', bookingRoutes);
// Booking result & cross-role detail routes: /api/bookings/* (A3.1)
router.use('/bookings', bookingsRoutes);

module.exports = router;

