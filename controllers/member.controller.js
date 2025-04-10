const Member = require("../models/member.model");
const User = require("../models/user.model");
const Workshop = require("../models/workshop.model");

const getMembers = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      res.status(404).json({ message: "Workshop not found" });
      return;
    }
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.params.id,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!member.role.permissions.member.includes("view")) {
      res
        .status(404)
        .json({ message: "You don't have permission to view members" });
      return;
    }

    const members = await Member.find({ workshop: req.params.id })
      .populate("user", "_id email name profileImage")
      .populate("role");
    res.status(200).json({ members });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getMembers };
