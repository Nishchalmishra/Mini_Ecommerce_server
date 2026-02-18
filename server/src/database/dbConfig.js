import mongoose from "mongoose";
import chalk from "chalk";

const dbConnection = async () => {
    try {
        await mongoose.connect("mongodb+srv://nishchalmishra14_db_user:yImgHUZPmaVZ1K9I@miniecommerce.kexmfcy.mongodb.net/", {
            maxPoolSize: 10,     // 🔥 KEY FIX
            minPoolSize: 2
        });
        // console.log(chalk.greenBright("Database is connected"));
    } catch (error) {
        console.log(error);
    }
};

export default dbConnection;