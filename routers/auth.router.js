const { Router } = require("express");
const { googleRegister, register } = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.post("/register/google", googleRegister);
authRouter.post("/register", register);

module.exports = authRouter;
