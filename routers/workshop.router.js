const { Router } = require("express");
const {
  getWorkshopDetails,
  updateWorkshop,
  getUserWorkshops,
  createWorkshop,
  deleteWorkshop,
  joinWorkshop,
  leaveWorkshop,
} = require("../controllers/workshop.controller");
const workshopRouter = Router();

workshopRouter.post("/", createWorkshop);
workshopRouter.get("/details/:id", getWorkshopDetails);
workshopRouter.get("/", getUserWorkshops);
workshopRouter.put("/join/:id", joinWorkshop);
workshopRouter.put("/leave/:id", leaveWorkshop);
workshopRouter.put("/:id", updateWorkshop);
workshopRouter.delete("/:id", deleteWorkshop);

module.exports = workshopRouter;
