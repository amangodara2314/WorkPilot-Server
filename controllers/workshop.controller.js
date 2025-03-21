const Workshop = require("../models/workshop.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const Member = require("../models/member.model");
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
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getWorkshopDetails };
