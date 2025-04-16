const { Router } = require("express");
const {
  googleRegister,
  register,
  googleLogin,
  login,
} = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.post("/register/google", googleRegister);
authRouter.post("/login/google", googleLogin);

authRouter.post("/register", register);
authRouter.post("/login", login);

module.exports = authRouter;
