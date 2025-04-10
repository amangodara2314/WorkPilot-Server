const User = require("../models/user.model");

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("currentWorkshop")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getUser };
