require("dotenv").config();
const Member = require("../models/member.model");
const Role = require("../models/role.model");
const User = require("../models/user.model");
const Workshop = require("../models/workshop.model");
const { oauth2Client } = require("../utils/googleConfig");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    const workshop = await Workshop.create({
      name: `${name}'s Workshop`,
      owner: user._id,
    });
    res.status(201).json({ user, workshop });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const googleRegister = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { code } = req.body;
    const googleResult = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleResult.tokens);

    const userResult = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
        googleResult.tokens.access_token
    );
    const userInfo = await userResult.json();
    const existingUser = await User.findOne({ email: userInfo.email });
    if (existingUser) {
      return res
        .status(403)
        .json({ message: "User already exists. Try logging in" });
    }

    const user = new User({
      name: userInfo.name,
      email: userInfo.email,
      isGoogleLogin: true,
      profileImage: userInfo.picture,
    });

    const workshop = await Workshop.create(
      [
        {
          name: `${userInfo.name}'s workshop`,
          owner: user._id,
        },
      ],
      { session }
    );
    console.log(user._id, workshop);

    user.currentWorkshop = workshop[0]._id;
    await user.save({ session });

    const userRole = await Role.findOne({ name: "Owner" });
    if (!userRole) {
      throw new Error("User role not found");
    }
    const member = await Member.create(
      [
        {
          user: user._id,
          workshop: workshop[0]._id,
          role: userRole._id,
        },
      ],
      { session }
    );
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ user, workshop: workshop[0], token });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const googleResult = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleResult.tokens);
    const userResult = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
        googleResult.tokens.access_token
    );
    const userInfo = await userResult.json();
    const existingUser = await User.findOne({ email: userInfo.email });
    if (!existingUser) {
      return res
        .status(403)
        .json({ message: "User does not exist. Try registering" });
    }
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET
    );
    res.status(200).json({ user: existingUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, googleRegister, googleLogin };
