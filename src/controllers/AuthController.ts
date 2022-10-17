import { Request, Response } from "express";
import { validationResult, matchedData } from 'express-validator'
import { AuthService } from "../services/AuthService";
import { MatchedData } from "../types/MatchedData";

export const signIn = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        res.json({ error: errors.mapped() });
        return;
    }

    const userData = matchedData(req);

    const validUser = await AuthService.validateUser(userData.email, userData.password);

    if (validUser instanceof Error) {
        res.status(400);
        res.json({ error: validUser.message });
        return;
    }

    res.json({ token: validUser });
};

export const signUp = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        res.json({ error: errors.mapped() });
        return;
    }

    const userData = matchedData(req) as MatchedData;

    const newUser = await AuthService.createUser(userData);

    if (newUser instanceof Error) {
        res.status(400);
        res.json({ error: newUser.message });
        return;
    }

    res.status(201);
    res.json({ token: newUser.token });
    return;
};