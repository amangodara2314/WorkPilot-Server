const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  batch: {
    enum: ["Bug", "Feature", "Documentation", "Other"],
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    enum: ["in-review", "in-progress", "backlog", "completed", "pending"],
    required: true,
    default: "pending",
  },
  priority: {
    enum: ["low", "medium", "high"],
    required: true,
    default: "low",
  },
  dueDate: {
    type: Date,
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
