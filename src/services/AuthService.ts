import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import State from '../models/State';
import User, { UserType } from '../models/User';
import { MatchedData } from '../types/MatchedData';

export const AuthService = {
    validateUser: async (email: string, password: string) => {
        const user = await User.findOne({ email: email });
        if (!user) return new Error('E-mail e/ou senha inválido');

        const match = bcrypt.compareSync(password, user.passwordHash);
        if (!match) return new Error('E-mail e/ou senha inválido');

        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        user.token = token;
        await user.save();

        return user.token;
    },
    createUser: async (newUserData: MatchedData) => {
        const hasUser = await User.findOne({ email: newUserData.email });
        if (hasUser) return new Error("E-mail existente");

        //Verificando se o estado existe
        if (Types.ObjectId.isValid(newUserData.state)) {
            const stateItem = await State.findById(newUserData.state);

            if (!stateItem) return new Error('Estado não existe');
        } else {
            return new Error('Código do estado inválido');
        }

        //criptgrafando senha e criando user
        const passwordHash = bcrypt.hashSync(newUserData.password, 10);

        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        const newUser: UserType = await User.create({
            name: newUserData.name,
            email: newUserData.email,
            state: newUserData.state,
            passwordHash,
            token
        });
        return newUser;
    }
}