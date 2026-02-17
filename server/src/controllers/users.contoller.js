import { User } from "../models/users.model.js"
import { asyncHandler } from "../services/asyncHandler.js"
import { emailVerificationMailgenContent, sendEmail, forgotPasswordMailgenContent } from "../services/mail.js"
import { ApiResponse } from "../services/apiResponse.js"
import {ApiError} from "../services/apiError.js"
import chalk from "chalk"
import crypto from "crypto"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(chalk.redBright(error), 500, "Something went wrong while generating access and refresh token")
    }
}

export const userRegister = asyncHandler(async (req, res) => {
    
    const { username, email, password, role } = req.body

    if(!username || !email || !password) {
        return res.status(400).json({error: "Please provide all the fields"})
    }

    const existingUser = await User.findOne({ email })
    
    if(existingUser) {
        return res.status(400).json({error: "User already exists"})
    }

    const user = await User.create({
        username,
        email,
        password,
        role,
        isEmailVerified: false
    })

    if (!user) return res.status(400).json({ error: "User not created" })
    
    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.verificationToken = hashedToken
    user.verificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                "User created successfully",
                { user: createdUser })
        )

})

export const userLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if(!email || !password) {
        return res.status(400).json({error: "Please provide all the fields"})
    }

    const user = await User.findOne({ email })

    if(!user) {
        return res.status(400).json({error: "User not found"})
    }

    // if(!user.isEmailVerified) {
    //     return res.status(400).json({error: "Please verify your email"})
    // }

    const isPasswordCorrect = await user.matchPassword(password)

    if (!isPasswordCorrect) return res.status(400).json({ error: "Incorrect password" })
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true,
    }

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                { user: createdUser })
        )

})

export const userLogout = asyncHandler(async (req, res) => { 

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
    )
    
})

export const getUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "User found successfully",
            { user: req.user }
        )
    )
})

export const verifyEmail = asyncHandler(async (req, res) => {

    const { token } = req.params
    // console.log(req.params)

    if(!token) {
        return res.status(400).json({error: "Please provide all the fields"})
    }
    console.log(typeof token)
    let hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({ verificationToken: hashedToken, verificationTokenExpiry: { $gt: Date.now() } })

    if(!user) {
        return res.status(400).json({error: "Invalid token"})
    }

    user.isEmailVerified = true
    user.verificationToken = ""
    user.verificationTokenExpiry = ""

    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            "Email verified successfully",
            { user }
        )
    )

})

export const resendEmailVerification = asyncHandler(async (req, res) => {

    // console.log(req.user?.id)

    const user = await User.findById(req.user?.id)

    if(!user) {
        return res.status(400).json({error: "User not found"})
    }

    if(user.isEmailVerified) {
        return res.status(400).json({error: "Email already verified"})
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.verificationToken = hashedToken
    user.verificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Verification email sent successfully"
        )
    )
})

export const forgotPassword = asyncHandler(async (req, res) => { 

    const { email } = req.body

    if(!email) {
        return res.status(400).json({error: "Please provide all the fields"})
    }

    const user = await User.findOne({ email })

    if(!user) {
        return res.status(400).json({error: "User not found"})
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.verificationToken = hashedToken
    user.verificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Password Reset",
        mailgenContent: forgotPasswordMailgenContent(
            user?.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${unhashedToken}`
        ),
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password reset email sent successfully"
        )
    )
})

export const resetPassword = asyncHandler(async (req, res) => {
    
    const { verificationToken } = req.params
    const { newPassword } = req.body

    let hashed = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findOne({ verificationToken: hashed, verificationTokenExpiry: { $gt: Date.now() } })

    if(!user) {
        return res.status(400).json({ error: "Invalid token" })
    }

    user.password = newPassword
    user.verificationToken = null
    user.verificationTokenExpiry = null   

    await user.save({ validateBeforeSave: false })      

    return res.status(200).json(
        new ApiResponse(
            200,
            "Password reset successfully",
            { user }
        )
    )
    
})