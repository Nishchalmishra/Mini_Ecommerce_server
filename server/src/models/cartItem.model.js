import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({

    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    }, 

    cartId: {
        type: Schema.Types.ObjectId,
        ref: "Cart"
    }, 

    quantity: {
        type: Number,
        required: true
    } 
}, {
    timestamps: true
})

export const CartItem = mongoose.model('CartItem', cartItemSchema)