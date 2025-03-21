const { Router } = require("express");
const authRouter = require("./auth.router");
const workshopRouter = require("./workshop.router");
const { authMiddleware } = require("../utils/middleware");
const router = Router();

router.use("/auth", authRouter);
router.use("/workshop", authMiddleware, workshopRouter);

module.exports = router;
