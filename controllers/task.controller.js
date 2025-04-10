const { default: mongoose } = require("mongoose");
const Member = require("../models/member.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

const createTask = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.body.workshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.task.includes("create")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to create a task" });
    }
    const task = await Task.create({ ...req.body, createdBy: req.userId });

    res.status(200).json({ message: "Task created successfully!", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.body.workshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.task.includes("edit")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit a task" });
    }
    console.log(req.body);
    const { assignedTo, ...rest } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        assignedTo: new mongoose.Types.ObjectId(assignedTo),
      },
      { new: true }
    ).populate("assignedTo", "name email _id profileImage");

    console.log(task);

    res.status(200).json({ message: "Task updated successfully!", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTasks = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.query.workshopId,
    }).populate("role");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    console.log(member, user, req.query);

    const id = new mongoose.Types.ObjectId(req.query.workshopId);
    console.log(id);

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const query = {
      workshop: id,
    };

    console.log(req.query.title);
    // Add filters only if they exist
    if (req.query.status && req.query.status != "null")
      query.status = req.query.status;
    if (req.query.priority && req.query.priority != "null")
      query.priority = req.query.priority;
    if (req.query.title && req.query.title != "") {
      query.title = { $regex: req.query.title, $options: "i" };
    }

    // If user is a member, restrict to assigned tasks
    if (member.role.name === "Member") {
      console.log("member");
      query.assignedTo = req.userId;
    }

    const totalCount = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email _id profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (member.role.name !== "Member") {
      console.log("tasks", tasks);
    }

    res.status(200).json({ tasks, totalCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const member = await Member.findOne({
      user: req.userId,
      workshop: req.query.workshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.task.includes("delete")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete a task" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Task deleted successfully!", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTask, updateTask, getTasks, deleteTask };
