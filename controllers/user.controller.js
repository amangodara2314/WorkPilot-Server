const Member = require("../models/member.model");
const User = require("../models/user.model");

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("currentWorkshop")
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const member = await Member.findOne({
      user: user._id,
      workshop: user.currentWorkshop._id,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    user.role = member.role.name || "Member";

    res.status(200).json({ user, permissions: member.role.permissions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getUser };
