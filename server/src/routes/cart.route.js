import { Router } from "express"; 
import { getCart, addToCart, removeFromCart } from "../controllers/cart.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").get(verifyJWT, getCart)
router.route("/").post(verifyJWT, addToCart)
router.route("/").delete(verifyJWT, removeFromCart)

export default router