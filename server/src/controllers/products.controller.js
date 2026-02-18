import {asyncHandler} from "../services/asyncHandler.js";
import { Product } from "../models/products.model.js";
import { ApiResponse } from "../services/apiResponse.js";
import { ApiError } from "../services/apiError.js";
import chalk from "chalk";
import {redis} from "../../redisClient.js"

export const getProducts = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const cacheKey = `product:page:${page}:limit:${limit}`;

    const cachedProduct = await redis.get(cacheKey);

    if (cachedProduct) {
        return res.json(JSON.parse(cachedProduct));
    }

    const products = await Product.find({})
        .select("name price stock category")
        .skip(skip)
        .limit(limit)
        .lean();

    const totalProducts = await Product.countDocuments();

    const responseData = new ApiResponse(200, {
        products,
        pagination: {
            total: totalProducts,
            page,
            limit,
            totalPages: Math.ceil(totalProducts / limit)
        }
    });

    await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        "EX",
        60
    );

    return res.status(200).json(responseData);
});


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