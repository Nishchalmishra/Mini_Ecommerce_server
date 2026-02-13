import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import crypto from "crypto"

const userSchema = new Schema({

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    refreshToken: {
        type: String,
    },

    role: {
        enum: ['user', 'admin'],
        type: String,
        required: true
    },

    verificationToken: {
        type: String,
    },

    verificationTokenExpiry: {
        type: Date,
    },

    isEmailVerified: {
        type: Boolean,
        default: false  
    }

}, {
    timestamps: true
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    const result = await bcrypt.compare(enteredPassword, this.password)
    console.log(result)
    return result
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id, 
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' })
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this._id, 
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' })
}

userSchema.methods.generateTemporaryToken = function () {

    const unhashedToken = crypto.randomBytes(32).toString("hex")

    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")

    const tokenExpiry = Date.now() + (20 * 60 * 1000)

    return { unhashedToken, hashedToken, tokenExpiry }
    
}

export const User = mongoose.model('User', userSchema)