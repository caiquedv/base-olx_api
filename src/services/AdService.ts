import { unlink } from "fs/promises";
import Category from "../models/Category";
import User from "../models/User";
import Ad from "../models/Ad";
import State from "../models/State";
import { cleanTmpDir, handleImages } from "../helpers/MulterAndSharp";
import DbAdFilter from "../types/DbAdFilter";


export const AdService = {
    getDbCategories: async () => {
        return await Category.find().lean();
    },
    getDbCatBySlug: async (category: string) => {
        return await Category.findOne({ slug: category });
    },
    formatNewAd: async (
        token: string,
        newAdData: { [fieldName: string]: string },
        files: Express.Multer.File[]
    ) => {
        const user = await User.findOne({ token });
        if (user) {
            const newAd = new Ad();
            newAd.status = 'true';
            newAd.idUser = user._id;
            newAd.state = user.state;
            newAd.dateCreated = new Date();
            newAd.title = newAdData.title;
            newAd.category = newAdData.category;
            newAd.price = +newAdData.price;
            newAd.priceNegotiable = (newAdData.priceNegotiable === 'true' ? true : false);
            newAd.description = newAdData.description;
            newAd.views = 0;
            newAd.images = await handleImages(files);

            if (newAd.images.length > 0) {
                newAd.images[0].default = true;
            }

            cleanTmpDir();

            return (await newAd.save())._id;
        }
    },
    getStateByName: async (stateName: string) => {
        return await State.findOne({ name: stateName });
    },
    dbAdFilter: async (filters: DbAdFilter,) => {
        return await Ad.find(filters)
            .sort({ dateCreated: (filters.sort == 'desc' ? -1 : 1) })
            .skip(filters.offset)
            .limit(filters.limit);
    },
    getAdInfo: async (id: string): Promise<any> => {
        let adInfo: any = {};

        adInfo.ad = await Ad.findById(id);

        if (!adInfo.ad) return new Error("Produto não existe");
        adInfo.ad.views++;
        await adInfo.ad.save();

        adInfo.category = await Category.findById(adInfo.ad.category);
        adInfo.state = await State.findById(adInfo.ad.state);
        adInfo.user = await User.findById(adInfo.ad.idUser);

        return adInfo;
    },
    getOtherAds: async (idUser: string) => {
        return await Ad.find({ status: true, idUser });
    },
    getUserByTk: async (token: string) => {
        return await User.findOne({ token });
    },
    validateEditAct: async (id: string, token: string) => {
        const ad = await Ad.findById(id).exec();
        if (!ad) {
            return new Error("Anuncio não existe");
        }

        const user = await User.findOne({ token });
        if (user && user._id.toString() !== ad.idUser) {
            return new Error("Este anúncio não é seu");
        }
    },
    updateDbAd: async (
        id: string,
        updates: object,
        files: Express.Multer.File[],
        delImages: string | string[]
    ) => {
        const adToUpdate: any = await Ad.findByIdAndUpdate(id, { $set: updates });

        adToUpdate.images = adToUpdate.images.concat(await handleImages(files))
        if (adToUpdate.images.length > 0) {
            adToUpdate.images[0].default = true;
        }

        cleanTmpDir();

        if (delImages) {
            adToUpdate.images = adToUpdate.images.filter(
                (e: any) => !delImages.includes(e.url)
            );

            try {
                if (Array.isArray(delImages)) {
                    for (let i in delImages) {
                        await unlink(`public/media/${delImages[i]}`);
                    }
                } else {
                    await unlink(`public/media/${delImages}`)
                }
            } catch (err) {
                return new Error("Erro ao deletar imagem")
            }
        }
    }
}