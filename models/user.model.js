const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    let userPassword = this.password;
    if (!userPassword) {
      const user = await User.findById(this._id).select("+password");
      if (!user) return false;
      userPassword = user.password;
    }

    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
