import { Router } from "express"
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").get(getProducts)
router.route("/:id").get(getProductById)
router.route("/addProduct").post(verifyJWT, addProduct)
router.route("/updateProduct/:id").put(verifyJWT, updateProduct)
router.route("/deleteProduct/:id").delete(verifyJWT, deleteProduct)

export default router