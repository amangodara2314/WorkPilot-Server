const { Router } = require("express");
const projectRouter = Router();
const projectController = require("../controllers/project.controller");

projectRouter.post("/", projectController.createProject);
projectRouter.get("/details/:id", projectController.getProjectDetails);
projectRouter.get("/:workshopId", projectController.getProjects);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);

module.exports = projectRouter;
