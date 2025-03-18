const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
  isGoogleLogin: {
    type: Boolean,
    default: false,
  },
  currentWorkshop: {
    type: mongoose.Schema.ObjectId,
    ref: "Workshop",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
