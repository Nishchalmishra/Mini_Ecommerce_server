import Redis from "ioredis";
import chalk from "chalk";
import cluster from "cluster";

const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
})

redis.on("connect", () => {
    if (cluster.worker?.id === 2) {
        console.log(chalk.red("Redis is connected.."));
    }
})

redis.on("error", (err) => console.log(err));

export {redis}