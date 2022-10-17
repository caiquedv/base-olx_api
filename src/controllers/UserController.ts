import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { UserService } from "../services/UserService";

export const listStates = async (req: Request, res: Response) => {
    res.json({ states: await UserService.getStates() });
};

export const info = async (req: Request, res: Response) => {
    let token = req.body.token;
    console.log('aq')
    try {
        
        const userInfo = await UserService.getUserInfo(token);
        if(userInfo instanceof Error) {
            res.json({error: userInfo.message});
            return;
        }
        

        // if(!userInfo) {
        //     res.json({error: "Token inválido ou inexistente"});
        //     return;
        // }
        

        res.json({
            name: userInfo.name,
            email: userInfo.email,
            state: userInfo.state,
            ads: userInfo.ads
        });
    } catch (error) {
        res.status(400);
        res.json({ error });
    }
};

export const editAction = async (req: Request, res: Response) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        res.json({ error: errors.mapped() });
        return;
    }

    const dataToUpdate = matchedData(req);

    const updated = await UserService.updateUserData(dataToUpdate);

    if (updated instanceof Error) {
        res.status(400);
        res.json({ error: updated.message });
        return;
    }
    res.json({});
};
