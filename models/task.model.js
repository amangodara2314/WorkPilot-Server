const mongoose = require("mongoose");
const { generateTaskCode } = require("../utils/helper");

const taskSchema = new mongoose.Schema({
  taskCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateTaskCode(),
  },
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
  badge: {
    type: String,
    enum: ["Bug", "Feature", "Documentation", "Other"],
    required: true,
    default: "Other",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true, // on delete cascade
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: [
      "in-review",
      "in-progress",
      "backlog",
      "completed",
      "pending",
      "canceled",
    ],
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
    required: true, // on delete cascade
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
