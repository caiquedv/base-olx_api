import { checkSchema } from 'express-validator';

export const AuthValidator = {
    signIn: checkSchema({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: { options: { min: 2 } },
            errorMessage: 'Senha precisa de pelo menos 2 caracteres'
        }
    }),
    signUp: checkSchema({
        name: {
            trim: true,
            isLength: { options: { min: 2 } },
            errorMessage: 'Nome precisa de pelo menos 2 caracteres'
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: { options: { min: 2 } },
            errorMessage: 'Senha precisa de pelo menos 2 caracteres'
        },
        state: {
            notEmpty: true,
            errorMessage: 'Estado não preenchido'
        }
    })
};