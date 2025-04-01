const { model } = require("mongoose");
const Member = require("../models/member.model");
const User = require("../models/user.model");
const Project = require("../models/project.model");

const createProject = async (req, res) => {
  try {
    const { name, description, emoji } = req.body;
    const user = await User.findById(req.userId);
    console.log(user);

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
    const project = await Project.create({
      name,
      description,
      emoji,
      createdBy: req.userId,
      workshop: user.currentWorkshop,
    });

    res.status(201).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workshop: req.params.workshopId });
    res.status(200).json({ projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createProject, getProjects, getProjectDetails };
