const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const bookingResultController = require('../controllers/bookingResultController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// GET /api/progress — Xem ProgressLog (Member: của mình; PT: hội viên liên quan; Admin: tất cả)
router.get(
  '/',
  authenticate,
  asyncHandler(bookingResultController.getProgressLogs)
);

// POST /api/progress — PT hoặc Admin ghi ProgressLog cho member
router.post(
  '/',
  authenticate,
  authorize(ROLES.TRAINER, ROLES.ADMIN),
  asyncHandler(bookingResultController.createProgressLog)
);

module.exports = router;
