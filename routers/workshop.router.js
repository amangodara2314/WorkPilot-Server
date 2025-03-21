const { Router } = require("express");
const { getWorkshopDetails } = require("../controllers/workshop.controller");
const workshopRouter = Router();

// workshopRouter.post("/", createWorkshop);
workshopRouter.get("/details/:id", getWorkshopDetails);
// workshopRouter.get("/:id", getWorkshop);
// workshopRouter.put("/:id", updateWorkshop);
// workshopRouter.delete("/:id", deleteWorkshop);

module.exports = workshopRouter;
