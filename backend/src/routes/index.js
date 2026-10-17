const express = require('express');
const healthController = require('../controllers/healthController');
const asyncHandler = require('../utils/asyncHandler');
const authRoutes = require('./auth');

const router = express.Router();
router.get('/health', asyncHandler(healthController.getHealth));

// Auth routes: /api/auth/*
router.use('/auth', authRoutes);

module.exports = router;
