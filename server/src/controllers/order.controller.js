import { Order } from "../models/orders.model.js";
import {Cart} from "../models/cart.model.js";
import { ApiResponse } from "../services/apiResponse.js";
import { asyncHandler } from "../services/asyncHandler.js";
import { ApiError } from "../services/apiError.js";
import { CartItem } from "../models/cartItem.model.js";
import {OrderItem} from "../models/orderItems.model.js"
import mongoose from "mongoose";

export const createOrder = asyncHandler(async (req, res) => {
    
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        
        const cart = await Cart.findOne({ userId: req.user?._id })

        if (!cart) {
            throw new ApiError(404, "Cart not found")
        }

        const cartItems = await CartItem.find({ cartId: cart._id })
            .populate("productId")
            .session(session)

        console.log(cartItems)

        if (cartItems.length === 0) {
            throw new ApiError(400, "Cart is empty")
        }

        let totalAmount = 0
        const orderItems = []

        for (const item of cartItems) {

            // console.log(item)
            
            const product = item.productId

            if (!product) {
                throw new ApiError(404, "Product not found")
            }

            if(product.stock < item.quantity){
                throw new ApiError(400, "Product out of stock")
            }

            totalAmount += product.price * item.quantity
            orderItems.push({
                productId: product._id,
                price: product.price,
                quantity: item.quantity
            })

            product.stock -= item.quantity
            await product.save({ session })

        }

        const order = await Order.create([{
            userId: req.user?._id,
            totalAmount,
            status: "pending"
        }], { session })

        orderItems.forEach(i => i.orderId = order[0]._id)
        await OrderItem.insertMany(orderItems, { session })

        await CartItem.deleteMany({ cartId: cart._id }, { session })


        await session.commitTransaction()

        return res.status(200).json(new ApiResponse(200, order[0]))

    } catch (error) {
        console.log(error)
    } finally {
        session.endSession()
    }

})

export const getOrder = asyncHandler(async (req, res) => {

    console.log(req.user)
    
    const order = await Order.find({ userId: req.user?._id })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res.status(200).json(new ApiResponse(200, order))

})

export const getOrderById = asyncHandler(async (req, res) => {
    
    const order = await Order.findById(req.params.id)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res.status(200).json(new ApiResponse(200, order))
})