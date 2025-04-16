const mongoose = require("mongoose");
const Task = require("./task.model");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  emoji: {
    type: String,
    required: true,
    default: "🚀",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workshop",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function (next) {
    const projectId = this.getQuery()?._id;

    if (projectId) {
      await Task.deleteMany({ project: projectId });
    } else {
      console.log("Project ID not found in deleteOne query");
    }

    next();
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
