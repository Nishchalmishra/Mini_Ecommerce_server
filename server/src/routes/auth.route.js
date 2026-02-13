import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userRegister, userLogin, userLogout, getUser, verifyEmail, resendEmailVerification, forgotPassword, resetPassword } from "../controllers/users.contoller.js";

const router = Router()

router.route("/register").post(userRegister)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT, userLogout)
router.route("/getUser").get(verifyJWT, getUser)
router.route("/verifyEmail/:token").post(verifyEmail)
router.route("/resendEmailVerification").post(verifyJWT, resendEmailVerification)
router.route("/forgotPassword").post(forgotPassword)
router.route("/resetPassword/:token").post(resetPassword)

export default router