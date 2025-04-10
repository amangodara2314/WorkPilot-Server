const Workshop = require("../models/workshop.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const Member = require("../models/member.model");
const { default: mongoose } = require("mongoose");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const getWorkshopDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }
    const [
      totalTasks,
      totalProjects,
      totalMembers,
      recentTasks,
      recentMembers,
    ] = await Promise.all([
      Task.countDocuments({ workshop: id }),
      Project.countDocuments({ workshop: id }),
      Member.countDocuments({ workshop: id }),
      Task.find({ workshop: id }).sort({ createdAt: -1 }).limit(5),
      Member.find({ workshop: id }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
      totalTasks,
      totalProjects,
      totalMembers,
      recentTasks,
      recentMembers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserWorkshops = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const workshops = await Member.find({ user: req.userId })
      .populate("workshop")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      });

    res.status(200).json({ workshops });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const createWorkshop = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const workshop = await Workshop.create(
      [
        {
          ...req.body,
          owner: req.userId,
        },
      ],
      { session }
    );
    const userRole = await Role.findOne({ name: "Owner" });
    if (!userRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    const member = await Member.create(
      [
        {
          user: req.userId,
          workshop: workshop[0]._id,
          role: userRole._id,
        },
      ],
      { session }
    );
    member[0].workshop = workshop[0];
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ workshop: member[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateWorkshop = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(req.userId);
    const member = await Member.findOne({ user: req.userId }).populate([
      {
        path: "role",
        populate: { path: "permissions", model: "Permission" },
      },
    ]);
    if (!user && !member) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!member.role.permissions.workshop.includes("edit")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update the workshop" });
    }
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, req.body, {
      session,
    });
    workshop.name = req.body.name;
    workshop.description = req.body.description;
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ workshop });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteWorkshop = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    if (!req.params.id) {
      return res.status(404).json({ message: "Workshop not found" });
    }
    const user = await User.findById(req.userId).session(session);
    const member = await Member.findOne({ user: req.userId })
      .populate({
        path: "role",
        populate: { path: "permissions", model: "Permission" },
      })
      .session(session);

    if (!user && !member) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found." });
    }

    if (!member.role.permissions.workshop.includes("delete")) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "You don't have permission to delete the workshop",
      });
    }

    const userWorkshop = await Member.findOne({
      user: req.userId,
      workshop: { $ne: new mongoose.Types.ObjectId(req.params.id) },
    })
      .populate({
        path: "user",
        populate: { path: "currentWorkshop", model: "Workshop" },
      })
      .session(session);

    if (!userWorkshop) {
      await session.abortTransaction();
      return res.status(403).json({
        message:
          "You cannot delete this workshop because you don't have any other workshop",
      });
    }

    await Task.deleteMany({ workshop: req.params.id }).session(session);
    await Member.deleteMany({ workshop: req.params.id }).session(session);
    await Project.deleteMany({ workshop: req.params.id }).session(session);
    const workshop = await Workshop.findByIdAndDelete(req.params.id).session(
      session
    );
    console.log(userWorkshop.workshop);
    user.currentWorkshop = userWorkshop.workshop;
    await user.save({ session });
    console.log(user.currentWorkshop);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Workshop deleted successfully!",
      workshop,
      userWorkshop: userWorkshop.workshop,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const joinWorkshop = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userRole = await Role.findOne({ name: "Member" });
    if (!userRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    const member = await Member.create(
      [
        {
          user: req.userId,
          workshop: req.params.id,
          role: userRole._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ member });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeWorkshop = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }
    user.currentWorkshop = req.params.id;
    await user.save();
    res.status(201).json({ message: "Workshop changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const leaveWorkshop = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const member = await Member.findOneAndDelete({
      user: req.userId,
      workshop: req.params.id,
    });
    res.status(200).json({ member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getWorkshopDetails,
  createWorkshop,
  updateWorkshop,
  getUserWorkshops,
  deleteWorkshop,
  joinWorkshop,
  leaveWorkshop,
  changeWorkshop,
};
