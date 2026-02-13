import Redis from "ioredis";
import chalk from "chalk";

const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
})

redis.on("connect", () => console.log(chalk.redBright("Redis is connected..")));

redis.on("error", (err) => console.log(err));

export {redis}