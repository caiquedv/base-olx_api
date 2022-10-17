import { Schema, Model, model, connection } from 'mongoose';

export interface UserType {
    _id?: string; 
    name: string;
    email: string;
    state: string;
    passwordHash: string;
    token: string;
}

const schema = new Schema<UserType>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    state: { type: String, required: true },
    passwordHash: { type: String, required: true },
    token:{ type: String, required: true }
});

const modelName: string = 'user';

export default (connection && connection.models[modelName])
    ? connection.models[modelName] as Model<UserType>
    : model<UserType>(modelName, schema);