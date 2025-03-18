const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Owner", "Admin", "Member"],
    required: true,
    trim: true,
  },
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
    required: true,
  },
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
