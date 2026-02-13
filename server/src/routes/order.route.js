import { Router } from "express";
import { createOrder, getOrder, getOrderById } from "../controllers/order.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").get(verifyJWT, getOrder)
router.route("/").post(verifyJWT, createOrder)
router.route("/:id").get(verifyJWT, getOrderById)

export default router