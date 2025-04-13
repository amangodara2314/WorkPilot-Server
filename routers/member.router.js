const { Router } = require("express");
const { getMembers } = require("../controllers/member.controller");
const memberRouter = Router();

memberRouter.get("/:id", getMembers);
memberRouter.put("/change-role/:id", getMembers);
module.exports = memberRouter;
