const express = require('express');
const healthController = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const trainerRoutes = require('./trainer');
const bookingsRoutes = require('./bookings');
const progressRoutes = require('./progress');
const reviewsRoutes = require('./reviews');

const router = express.Router();
router.get('/health', asyncHandler(healthController.getHealth));

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

// Profile routes: /api/profile/*
router.use('/profile', profileRoutes);

// Trainer routes: /api/trainer/*
router.use('/trainer', trainerRoutes);

// Booking result & detail: /api/bookings/*  (A3.1)
router.use('/bookings', bookingsRoutes);

// ProgressLog: /api/progress/*  (A3.1)
router.use('/progress', progressRoutes);

// Reviews: /api/reviews/*  (A3.2)
router.use('/reviews', reviewsRoutes);

module.exports = router;

