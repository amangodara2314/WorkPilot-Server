const mongoose = require("mongoose");

const permissions = new mongoose.Schema({
  workshop: {
    type: [String],
    required: true,
    default: [],
  },
  project: {
    type: [String],
    required: true,
    default: [],
  },
  task: {
    type: [String],
    required: true,
    default: [],
  },
  member: {
    type: [String],
    required: true,
    default: [],
  },
});

const Permission = mongoose.model("Permission", permissions);
module.exports = Permission;
