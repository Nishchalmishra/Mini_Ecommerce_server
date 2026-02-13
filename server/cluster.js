import cluster from "cluster";
import os from "os";
import chalk from "chalk";

const maxCores = os.cpus().length;

if (cluster.isPrimary) {

    console.log(chalk.yellow(`Master ${process.pid} is running`));

    for (let i = 0; i < maxCores; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log("Worker", worker.id, "died", new Date().toLocaleString());
        cluster.fork();
    });

} else {

    const { default: app } = await import("./app.js");
    

    app.get("/", (req, res) => res.send(`Worker ${process.pid} is running`));

    app.listen(process.env.PORT, () => {
        console.log(process.env.PORT)
        console.log(chalk.green(`Worker ${process.pid} started`));
    });
}