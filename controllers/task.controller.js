const Member = require("../models/member.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

const createTask = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const member = await Member.findOne({ user: req.userId }).populate({
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
    const member = await Member.findOne({ user: req.userId }).populate({
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
    const task = await Task.updateOne({ _id: req.params.id }, req.body);

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
    const tasks = await Task.find({
      workshop: req.query.workshopId,
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo,
      project: req.query.project,
      title: { $regex: req.query.title, $options: "i" },
    }).populate("createdBy", "name email _id");

    res.status(200).json({ tasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const member = await Member.findOne({ user: req.userId }).populate({
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
