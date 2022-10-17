import { Schema, Model, model, connection } from 'mongoose';

export interface CategoryType {
    name: string;
    slug: string;
}

const schema = new Schema<CategoryType>({
    name: { type: String, required: true },
    slug: { type: String, required: true }
});

const modelName: string = 'Category';

export default (connection && connection.models[modelName])
    ? connection.models[modelName] as Model<CategoryType>
    : model<CategoryType>(modelName, schema);