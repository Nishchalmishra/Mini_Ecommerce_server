import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({

    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order"
    }, 

    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
        
    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    } 
}, {
    timestamps: true
})

export const OrderItem = mongoose.model('OrderItem', orderItemSchema)