require("dotenv").config();
const Member = require("../models/member.model");
const Role = require("../models/role.model");
const User = require("../models/user.model");
const Workshop = require("../models/workshop.model");
const { oauth2Client } = require("../utils/googleConfig");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const user = new User({
      name,
      email,
      password,
    });

    const workshop = await Workshop.create(
      [
        {
          name: `${name}'s Workshop`,
          owner: user._id,
        },
      ],
      { session }
    );

    user.currentWorkshop = workshop[0]._id;
    await user.save({ session });

    const userRole = await Role.findOne({ name: "Owner" });
    if (!userRole) {
      throw new Error("Owner role not found");
    }

    await Member.create(
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

    const userObj = user.toObject();
    delete userObj.password;

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Registration successful",
      user: userObj,
      workshop: workshop[0],
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Email does not exist." });
    }

    if (user.isGoogleLogin) {
      return res.status(400).json({
        message:
          "This account uses Google Authentication. Please login with Google.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    let currentWorkshop = null;
    if (user.currentWorkshop) {
      currentWorkshop = await Workshop.findById(user.currentWorkshop);
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Login successful",
      user: userObj,
      token,
      currentWorkshop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
    const userObj = user.toObject();

    delete userObj.password;
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      user: userObj,
      workshop: workshop[0],
      token,
      message: "Registration successful",
    });
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
    res.status(200).json({
      message: "Login successful",
      user: existingUser,
      token,
      currentWorkshop: existingUser.currentWorkshop,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, googleRegister, googleLogin };
