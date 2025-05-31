import express from "express"
import cors from "cors"
import chalk from "chalk";
import { userRouter } from "./routes/userRoutes/user";

const app = express();
app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.json({ msg : "health check endpoint is working!",success : true })
})

app.use("/api/v1/user",userRouter)


app.listen(process.env.PORT, () => {
  const label = chalk.hex("#FF6B6B")("[server]");
  const portText = chalk.bold.green(`http://localhost:${process.env.PORT}`);
  console.log(`${label} listening on ${portText}`);
});
