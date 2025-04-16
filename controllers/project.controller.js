const { model, default: mongoose } = require("mongoose");
const Member = require("../models/member.model");
const User = require("../models/user.model");
const Project = require("../models/project.model");
const Workshop = require("../models/workshop.model");
const Task = require("../models/task.model");

const createProject = async (req, res) => {
  try {
    const { name, emoji, description } = req.body;
    const user = await User.findById(req.userId);

    const member = await Member.findOne({
      user: req.userId,
      workshop: user.currentWorkshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.project.includes("create")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to create a project" });
    }
    console.log(user);
    const newProject = await Project.create({
      name,
      emoji,
      description,
      createdBy: req.userId,
      workshop: user.currentWorkshop,
    });
    const project = await newProject.populate(
      "createdBy",
      "name email _id profileImage"
    );
    res.status(201).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      workshop: req.params.workshopId,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json({ projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getProjectDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const workshop = await Workshop.findById(req.query.workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      workshop: req.query.workshopId,
    }).populate("createdBy", "name email _id profileImage");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,

      status: "completed",
    });
    const pendingTasks = await Task.countDocuments({
      project: project._id,
      $and: [{ status: { $ne: "completed" } }, { status: { $ne: "canceled" } }],
    });
    res.status(200).json({ project, totalTasks, pendingTasks, completedTasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const member = await Member.findOne({
      user: req.userId,
      workshop: user.currentWorkshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.project.includes("edit")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update a project" });
    }
    const project = await Project.findByIdAndUpdate(req.params.id, req.body);

    res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const deleteProject = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const member = await Member.findOne({
      user: req.userId,
      workshop: user.currentWorkshop,
    }).populate({
      path: "role",
      populate: { path: "permissions", model: "Permission" },
    });
    if (!user || !member) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!member.role.permissions.project.includes("delete")) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete a project" });
    }
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.deleteOne();
    res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
};
