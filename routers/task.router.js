const { Router } = require("express");
const taskRouter = Router();
const taskController = require("../controllers/task.controller");

taskRouter.get("/", taskController.getTasks);
taskRouter.post("/", taskController.createTask);
taskRouter.put("/:id", taskController.updateTask);
taskRouter.delete("/:id", taskController.deleteTask);

module.exports = taskRouter;
