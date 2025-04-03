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
    type: String,
    enum: ["Bug", "Feature", "Documentation", "Other"],
    required: true,
    default: "Other",
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
    type: String,
    enum: ["in-review", "in-progress", "backlog", "completed", "pending"],
    required: true,
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
    default: "low",
  },
  dueDate: {
    type: Date,
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workshop",
    required: true,
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
