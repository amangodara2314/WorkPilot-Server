const { Router } = require("express");
const {
  googleRegister,
  register,
  googleLogin,
} = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.post("/register/google", googleRegister);
authRouter.post("/login/google", googleLogin);

authRouter.post("/register", register);
authRouter.post("/login", register);

module.exports = authRouter;
