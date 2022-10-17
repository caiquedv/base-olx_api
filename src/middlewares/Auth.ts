import { NextFunction, Request, Response } from "express";
import User from "../models/User";

export const Auth = {
    private: async (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token || req.body.token;
        if (token) {
            const user = await User.findOne({ token });
            if (user) next();
            else {
                res.status(400);
                res.json({error: 'Token inválido'});
            }
            return;
        }
        res.status(403);
        res.json({ notallowed: true });
    }
}
