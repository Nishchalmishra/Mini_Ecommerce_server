import {asyncHandler} from "../services/asyncHandler.js";
import { Product } from "../models/products.model.js";
import { ApiResponse } from "../services/apiResponse.js";
import { ApiError } from "../services/apiError.js";
import chalk from "chalk";
import {redis} from "../../redisClient.js"

export const getProducts = asyncHandler(async (req, res) => {

    const cachedProduct = await redis.get("product:all")

    if(cachedProduct) {
        console.log(chalk.redBright('From redis'));
        return res.json(JSON.parse(cachedProduct));
    } else {
        console.log("No cache")
    }
    
    const products = await Product.find({})

    await redis.set(
        "product:all",
        JSON.stringify(products),
        'EX',
        60
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, products)
        )
})

export const getProductById = asyncHandler(async (req, res) => {
    
    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, product)
        )
})

export const addProduct = asyncHandler(async (req, res) => {
    
    const { role } = req.user
    // console.log(req.user)

    if (role !== "admin") {
        throw new ApiError(401, "Unauthorized Request")
    }

    const { name, price, stock, category } = req.body
    
    const product = await Product.create({
        name,
        price,
        stock,
        category
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, product)
        )

})

export const updateProduct = asyncHandler(async (req, res) => {
    
    const { role } = req.user

    if (role !== "admin") {
        throw new ApiError(401, "Unauthorized Request")
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const { name, price, stock, category } = req.body

    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = price
    if (stock !== undefined) product.stock = stock
    if (category !== undefined) product.category = category

    await product.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, product)
        )
})


export const deleteProduct = asyncHandler(async (req, res) => {

    const { role } = req.user
    
    if(role !== "admin") {
        throw new ApiError(401, "Unauthorized Request")
    }
    
    const product = await Product.findById(req.params.id)    

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    await product.deleteOne()                                              

    return res
        .status(200)
        .json(
            new ApiResponse(200, product)
        )

})