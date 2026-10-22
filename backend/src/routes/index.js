const express = require('express');
const healthController = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const trainerRoutes = require('./trainer');

const router = express.Router();
router.get('/health', asyncHandler(healthController.getHealth));

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

// Profile routes: /api/profile/*
router.use('/profile', profileRoutes);

// Trainer routes: /api/trainer/*
router.use('/trainer', trainerRoutes);
router.use('/admin', require('./admin'));

module.exports = router;

