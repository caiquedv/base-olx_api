import { Schema, Model, model, connection } from 'mongoose';

export interface AdType {
    idUser: string;
    state: string;
    category: string;
    images: AdImages[];
    dateCreated: Date;
    title: string;
    price: number;
    priceNegotiable: boolean;
    description: string;
    views: number;
    status: string;
}

export interface AdImages {
    url: string
    default: boolean
}

const subSchema = new Schema<AdImages>({
    url: String,
    default: Boolean
}, {_id: false});

const schema = new Schema<AdType>({
    idUser: String,
    state: String,
    category: { type: String, required: true },
    images: [subSchema],
    dateCreated: Date,
    title: { type: String, required: true },
    price: Number,
    priceNegotiable: Boolean,
    description: String,
    views: Number,
    status: String // String pois teremos varios status e não só ativo/inativo
});

const modelName: string = 'Ad';

export default (connection && connection.models[modelName])
    ? connection.models[modelName] as Model<AdType>
    : model<AdType>(modelName, schema);