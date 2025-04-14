const { Router } = require("express");
const { getMembers, changeRole } = require("../controllers/member.controller");
const memberRouter = Router();

memberRouter.get("/:id", getMembers);
memberRouter.put("/change-role/:id", changeRole);
module.exports = memberRouter;
