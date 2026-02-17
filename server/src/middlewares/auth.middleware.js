import { User } from "../models/users.model.js"
import { asyncHandler } from "../services/asyncHandler.js"
import { ApiError } from "../services/apiError.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedTOken = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(decodedTOken)
        const user = await User.findById(decodedTOken?.id).select("-password -refreshToken -temporaryToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        // console.log("middleware : ",user)
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }

})