const express = require('express');
const healthController = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const trainerRoutes = require('./trainer');
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

// Subscription routes: /api/subscriptions/*
router.use('/subscriptions', subscriptionRoutes);

// Booking routes: /api/bookings/*
router.use('/bookings', bookingRoutes);

module.exports = router;

