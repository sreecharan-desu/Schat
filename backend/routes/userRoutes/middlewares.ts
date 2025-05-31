import jwt from "jsonwebtoken"
import { User } from "../../db/db";
import dotenv from "dotenv"
import { NextFunction, Request, Response } from "express";
dotenv.config()

export const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const authorization = req.headers.authorization;
    if (authorization && authorization != null) {
        const token = authorization.split(" ")[1]

        try {
            const email: any = await jwt.decode(token);
            if (email) {
                const user = await User.findOne({
                    email: email.email
                })

                if (user) {
                    const isverified = await jwt.verify(authorization.split(" ")[1], process.env.JWT_SECRET!)
                    if (isverified) {
                        next()
                    } else {
                        throw new Error("UNAUTHORIZED")
                    }
                } else {
                    throw new Error("UNAUTHORIZED")

                }
            } else {
                throw new Error("UNAUTHORIZED")

            }


        } catch (e) {
            res.json({
                error: e instanceof Error ? e.message : 'Unknown error',
                msg: "UNAUTHORIZED",
                success: false
            })
        }
    } else {
        res.json({
            msg: "UNAUTHORIZED",
            success: false
        })
    }

}

export const getCurrentUserEmail = async (req: Request) => {
    const authorization = req.headers.authorization;

    if (authorization && authorization != null) {
        const token: any = authorization.split(" ")[1]

        try {
            const email: any = await jwt.decode(token);
            if (email) {
                const user = await User.findOne({
                    email: email.email
                })

                if (user) {
                    const isverified = await jwt.verify(authorization.split(" ")[1], process.env.JWT_SECRET!)
                    if (isverified) {
                        return { email, success: true }
                    } else {
                        throw new Error("UNAUTHORIZED")
                    }
                } else {
                    throw new Error("UNAUTHORIZED")

                }
            } else {
                throw new Error("UNAUTHORIZED")

            }


        } catch (e) {
            return ({
                msg: "UNAUTHORIZED",
                success: false
            })
        }
    } else {
        return ({
            msg: "UNAUTHORIZED",
            success: false
        })
    }

}