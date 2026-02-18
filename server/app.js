import dbConnection from "./src/database/dbConfig.js";
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { redis } from "./redisClient.js";
import authRoute from "./src/routes/auth.route.js"
import cartRoute from "./src/routes/cart.route.js"
import productRoute from "./src/routes/product.route.js"
import orderRoute from "./src/routes/order.route.js"
import chalk from "chalk"
import cluster from "cluster"

dotenv.config({quiet: true})
dbConnection()
    .then(() => {
        if (cluster.worker?.id === 1) {
            console.log(chalk.greenBright("Database Connected.."));
        }
    })

const app = express()

app.use(cors())
app.use(express.json())

const rateLimiter = async(req,res,next) => {
    
    const ip = req.ip
    const key = `rateLimit:${ip}`

    const current = await redis.incr(key)

    if (current === 1) {
        await redis.expire(key, 60)
    }

    if(current > 10) {
        return res.status(429).json({error: "Too many requests"})
    }

    next()
}

const responseTime = async(req,res,next) => {
    const timeStamp = Date.now()
    res.on("finish", () => {
        const responseTime = Date.now() - timeStamp
        // console.log(`Response time: ${responseTime}ms`)
    })
    next()
}

// app.use(rateLimiter)
app.use(responseTime)

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/cart", cartRoute)
app.use("/api/v1/products", productRoute)
app.use("/api/v1/orders", orderRoute)

export default app

