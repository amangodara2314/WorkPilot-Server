const { Router } = require("express");
const authRouter = require("./auth.router");
const workshopRouter = require("./workshop.router");
const { authMiddleware } = require("../utils/middleware");
const projectRouter = require("./project.router");
const taskRouter = require("./task.router");
const router = Router();

router.use("/auth", authRouter);
router.use("/workshop", authMiddleware, workshopRouter);
router.use("/project", authMiddleware, projectRouter);
router.use("/task", authMiddleware, taskRouter);

module.exports = router;
