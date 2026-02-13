import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
   
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    }

}, {
    timestamps: true
})

export const Order = mongoose.model('Order', orderSchema)