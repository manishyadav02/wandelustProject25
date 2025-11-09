import express from "express";
import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";

import passport from "passport";
import { saveRedirectUrl } from "../middleware.js";
import * as userController from "../controllers/users.js";
const router = express.Router();

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signupUser));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    userController.loginUser
  );

router.get("/logout", userController.logoutUser);

export default router;
