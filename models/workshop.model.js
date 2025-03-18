const mongoose = require("mongoose");
const { generateInviteCode } = require("../utils/helper");
const workshopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateInviteCode(),
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Workshop = mongoose.model("Workshop", workshopSchema);
module.exports = Workshop;
