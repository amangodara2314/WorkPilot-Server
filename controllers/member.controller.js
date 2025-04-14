const Member = require("../models/member.model");
const Role = require("../models/role.model");
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
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }
    const members = await Member.find({ workshop: req.params.id })
      .populate("user", "_id email name profileImage")
      .populate("role");
    if (member.role.name == "Member") {
      res.status(200).json({ members, joinUrl: null });
      return;
    }
    res.status(200).json({
      members,
      joinUrl: `${process.env.CLIENT_URL}/workshop/join/${workshop.inviteCode}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeRole = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const existingMember = await Member.findById(req.params.id).populate(
      "role"
    );
    if (existingMember.role.name == "Owner") {
      return res.status(400).json({
        message: "You cannot change the role of workshop's owner",
      });
    }
    const workshop = await Workshop.findById(req.body.workshop);
    if (!workshop) {
      res.status(404).json({ message: "Workshop not found" });
      return;
    }
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.body.workshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (member._id == req.params.id) {
      res.status(404).json({ message: "You can't change your own role" });
      return;
    }
    if (!member || !member.role.permissions.member.includes("edit")) {
      res
        .status(404)
        .json({ message: "You don't have permission to edit members" });
      return;
    }
    const role = await Role.findOne({ name: req.body.role });
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }
    await Member.findByIdAndUpdate(req.params.id, { role: role._id });
    res.status(200).json({ message: "Role changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getMembers, changeRole };
