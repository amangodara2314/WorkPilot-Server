const { Router } = require("express");
const authRouter = require("./auth.router");
const workshopRouter = require("./workshop.router");
const { authMiddleware } = require("../utils/middleware");
const projectRouter = require("./project.router");
const taskRouter = require("./task.router");
const userRouter = require("./user.router");
const memberRouter = require("./member.router");
const router = Router();

router.use("/auth", authRouter);
router.use("/workshop", authMiddleware, workshopRouter);
router.use("/project", authMiddleware, projectRouter);
router.use("/task", authMiddleware, taskRouter);
router.use("/user", authMiddleware, userRouter);
router.use("/member", authMiddleware, memberRouter);

module.exports = router;
