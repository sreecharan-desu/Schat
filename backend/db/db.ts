import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import chalk from "chalk";

export const connectMongooseDb = async () => {
    const name = chalk.hex("#7F5AF0")("[database]");
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log(`${name} ${chalk.green("connected successfully")}`);
    } catch (error) {
        console.error(`${name} ${chalk.red("failed to connect")}`);
        console.error(chalk.gray("Details:"), error);
        throw new Error("Failed to connect to MongoDB");
    }
};



const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    password: String
})

export const User = mongoose.model('User', userSchema);


connectMongooseDb();