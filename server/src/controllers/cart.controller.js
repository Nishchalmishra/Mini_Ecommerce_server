import { Cart } from "../models/cart.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
import { ApiResponse } from "../services/apiResponse.js";
import { ApiError } from "../services/apiError.js";
import { CartItem } from "../models/cartItem.model.js";
import { Product } from "../models/products.model.js";
import mongoose from "mongoose";

export const getCart = asyncHandler(async (req, res) => {
    // console.log("user",req.user)
    const cart = await Cart.findOne({ userId: req.user?._id })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const cartItems = await CartItem.find({ cartId: cart._id })
        .populate("productId")
    
    

    return res
        .status(200)
        .json(
            new ApiResponse(200, cart, cartItems)
        )
})

export const addToCart = asyncHandler(async (req, res) => {

    const { productId, quantity } = req.body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID")
    }

    if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Invalid quantity")
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const cart = await Cart.findOne({ userId: req.user?._id })
    if (!cart) {
        cart = await Cart.create({ userId: req.user?._id })
    }

    const cartItem = await CartItem.findOne({ productId, cartId: cart._id })

    if (cartItem) {
        cartItem.quantity += quantity
        await cartItem.save()
    } else {
        await CartItem.create({ productId, cartId: cart._id, quantity })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Item added to cart"))
})

export const removeFromCart = asyncHandler(async (req, res) => {
    
    const { productId } = req.body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID")
    }

    const cart = await Cart.findOne({ userId: req.user?._id })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const deletedItem = await CartItem.findOneAndDelete({
        productId,
        cartId: cart._id
    })

    if (!deletedItem) {
        throw new ApiError(404, "Item not found in cart")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Item removed from cart"))

})
