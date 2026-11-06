const router = require("express").Router();
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const service = require("../services/adminService");
router.use(authenticate, authorize("admin"));
const handle = (fn, status = 200) =>
  asyncHandler(async (req, res) =>
    sendSuccess(res, await fn(req), "Success", status),
  );
router.get(
  "/dashboard",
  handle(() => service.dashboard()),
);
router.get(
  "/packages",
  handle((req) => service.packages(req.query)),
);
router.post(
  "/packages",
  handle((req) => service.savePackage(null, req.body), 201),
);
router.patch(
  "/packages/:id",
  handle((req) => service.savePackage(req.params.id, req.body)),
);
router.get(
  "/users",
  handle((req) => service.users(req.query)),
);
router.get(
  "/users/:id",
  handle((req) => service.getUser(req.params.id)),
);
router.post(
  "/users",
  handle((req) => service.saveUser(null, req.body, req.user), 201),
);
router.patch(
  "/users/:id",
  handle((req) => service.saveUser(req.params.id, req.body, req.user)),
);
router.get(
  "/bookings",
  handle((req) => service.bookings(req.query)),
);
router.patch(
  "/bookings/:id/status",
  handle((req) => service.setBookingStatus(req.params.id, req.body.status)),
);
router.get(
  "/subscriptions",
  handle((req) => service.subscriptions(req.query)),
);
router.post(
  "/subscriptions/:id/confirm-payment",
  handle((req) => service.confirmPayment(req.params.id)),
);
router.get(
  "/reports/revenue",
  handle((req) => service.revenue(req.query)),
);
module.exports = router;
