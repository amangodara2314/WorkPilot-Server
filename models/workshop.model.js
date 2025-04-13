const mongoose = require("mongoose");
const { generateInviteCode } = require("../utils/helper");
const Member = require("./member.model");
const Project = require("./project.model");
const Task = require("./task.model");
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

workshopSchema.pre(
  "deleteOne",
  { query: true, document: false },
  async function (next) {
    const workshopId = this.getQuery()._id;
    await Promise.all([
      Task.deleteMany({ workshop: workshopId }),
      Project.deleteMany({ workshop: workshopId }),
      Member.deleteMany({ workshop: workshopId }),
    ]);
    next();
  }
);

const Workshop = mongoose.model("Workshop", workshopSchema);
module.exports = Workshop;
