import { Types } from "mongoose";
import bcrypt from 'bcrypt';
import Ad from "../models/Ad";
import Category, { CategoryType } from "../models/Category";
import State, { StateType } from "../models/State";
import User, { UserType } from "../models/User"
import { MatchedData } from "../types/MatchedData";

export const UserService = {
    getStates: async () => {
        return await State.find();
    },
    getUserInfo: async (token: string) => {
        console.log('token')
        const user = await User.findOne({ token }) as UserType;
        if (!user) {
            return new Error("Token inválido ou inexistente");
        }

        const state = await State.findById(user.state) as StateType;
        const ads = await Ad.find({ idUser: user._id });

        let adList = [];

        for (let i in ads) {
            const category = await Category.findById(ads[i].category) as CategoryType;

            adList.push({ ...ads[i], category: category.slug }); // forma abrv 
        }

        return { name: user.name, email: user.email, state: state.name, ads: adList };
    },
    updateUserData: async (userData: MatchedData) => {
        let updates: Partial<UserType> = {};
        let updateData = Object.keys(userData);

        for (let i in updateData) {
            switch (updateData[i]) {
                case 'name':
                    updates.name = userData.name;
                    break;
                case 'email':
                    const emailCheck = await User.findOne({ email: userData.email });

                    if (emailCheck) return new Error("E-mail já existe");

                    updates.email = userData.email;
                    break;
                case 'state':
                    if (Types.ObjectId.isValid(userData.state)) {
                        const stateCheck = await State.findById(userData.state);

                        if (!stateCheck) return new Error("Estado não existe");

                        updates.state = userData.state;
                    } else {
                        return new Error("Código do estado inválido");
                    }
                    break;
                case 'password':
                    updates.passwordHash = bcrypt.hashSync(userData.password, 10)
                    break;
            }
        }
        await User.findOneAndUpdate({ token: userData.token }, { $set: updates });
    }
}