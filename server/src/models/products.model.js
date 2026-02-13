import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({

    name:{
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ''
    }, 

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    } 
}, {
    timestamps: true
})

export const Product = mongoose.model('Product', productSchema)