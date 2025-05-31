import express from "express";
import { User } from "../../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCurrentUserEmail, userAuthMiddleware } from "./middlewares";
import dotenv from "dotenv"
dotenv.config()

export const userRouter = express.Router()

userRouter.post("/signup", async (req, res) => {

    try {
        const { email, password } = req.body;


        const duplicateUser = await User.findOne({
            email: email,
        })
        if (duplicateUser) {
            res.json({
                msg: `${email} is already taken`,
                success: false
            })
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10)

            const user = await User.create({
                email: email,
                name: email.split("@")[0],
                password: hashedPassword
            })

            res.json({
                msg: `user successfully created with id : ${user._id}`,
                success: true
            })
        }

    } catch (e) {
        res.json({
            error: e,
            msg: `failed to create user`,
            success: false
        })
    }

})

userRouter.post("/signin", async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email: email
        })

        if (user && user.password) {
            const isPassowrdValid = await bcrypt.compare(password, user.password);
            if (isPassowrdValid) {
                const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!)

                res.json({
                    token,
                    msg: "Successfully signed in",
                    success: true,
                    websocketURL: `${process.env.WEBSOCKET_URL}?token=${token}`
                })

            }
            else {
                res.json({
                    msg: "Invalid Creds",
                    success: false
                })
            }
        } else {
            res.json({
                msg: "Invalid Creds",
                success: false
            })
        }
    } catch (e) {
        res.json({
            error: e,
            msg: `failed to signin user`,
            success: false
        })
    }

})

userRouter.get('/me', userAuthMiddleware, async (req, res) => {

    try {
        const currentUserEmail = await getCurrentUserEmail(req);
        if (currentUserEmail && currentUserEmail.success) {
            const user = await User.findOne({
                email: currentUserEmail.email.email
            })


            const filtered_user = {
                name: user?.name,
                email: user?.email
            }

            if (user) {
                res.json({
                    user: filtered_user,
                    success: true,
                    msg: "user fetched successfully",
                })
            } else {
                throw new Error("UNAUTHORIZED")

            }
        } else {
            throw new Error("UNAUTHORIZED")
        }
    } catch (e) {
        res.json({
            msg: "Failed to fetch data",
            success: false
        })
    }
})


userRouter.get('/users/:email', userAuthMiddleware, async (req, res) => {
    try {
        const email = req.params.email;

        const users = await User.find({
            email: { $regex: email, $options: 'i' } // 'i' for case-insensitive
        });

        res.json({
            users,
            userCount: users.length,
            success: true,
            msg: `Found ${users.length} users.`
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            msg: 'Failed to find users, please try again'
        });
    }
});


// Websocket logic

