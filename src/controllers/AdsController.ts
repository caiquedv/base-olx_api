import { Request, Response } from "express";
import { Types } from "mongoose";
import { AdService } from "../services/AdService";
import DbAdFilter from "../types/DbAdFilter";

export const getCategories = async (req: Request, res: Response) => {
    const dbCategories = await AdService.getDbCategories();

    let categories = [];

    for (let i in dbCategories) {
        categories.push({
            ...dbCategories[i],
            img: `${process.env.BASE}/assets/images/${dbCategories[i].slug}.png`
        });
    }

    res.json({ categories });
};

export const addAction = async (req: Request, res: Response) => {
    let { title, price = 0, priceNegotiable, description, category, token } = req.body;

    if (!title || !category) {
        res.json({ error: "Titulo e/ou categoria não foram preenchidos" });
        return;
    }

    const dbCategory = await AdService.getDbCatBySlug(category);

    if (!dbCategory) {
        res.status(400);
        res.json({ error: "Categoria inexistente" });
        return;
    }
    category = dbCategory._id;

    if (price) price = parseFloat(
        price.replace(".", '').replace(",", '.').replace("R$ ", '')
    );

    const newAdData: { [fieldName: string]: string } = {
        title,
        category,
        price,
        priceNegotiable,
        description,
    }

    const files = req.files as Express.Multer.File[];

    const newAdId = await AdService.formatNewAd(token, newAdData, files);

    res.status(201);
    res.json({ id: newAdId });

};

export const getList = async (req: Request, res: Response) => {
    let { sort = 'asc', offset = 0, limit = 8, query, category, state } = req.query;

    let filters: DbAdFilter = {
        status: true,
        sort: `${sort}`,
        offset: +offset,
        limit: +limit
    };

    if (query) {
        filters.title = { '$regex': query, '$options': 'i' };
    } 
    
    if (category) {
        const dbCategory = await AdService.getDbCatBySlug(category as string);

        if (dbCategory) filters.category = dbCategory._id.toString(); // erro por aq
    } 
    
    if (state) {
        
        const dbState = await AdService.getStateByName(`${state}`.toUpperCase());
        
        if (dbState) filters.state = dbState._id.toString();
    }

    const filteredAds = await AdService.dbAdFilter(filters);

    let ads = [];
    for (let i in filteredAds) {
        let image;
        let defaultImg = filteredAds[i].images.find(e => e.default);

        image = defaultImg
            ? `${process.env.BASE}/media/${defaultImg.url}`
            : `${process.env.BASE}/media/default.jpg`;

        ads.push({
            id: filteredAds[i]._id,
            title: filteredAds[i].title,
            price: filteredAds[i].price,
            priceNegotiable: filteredAds[i].priceNegotiable,
            image
        });
    }
    res.json({ ads, adsTotal: filteredAds.length });
};

export const getItem = async (req: Request, res: Response) => {
    let { id, other = null } = req.query;


    if (!id) {
        res.status(400);
        res.json({ error: "Sem produto" });
        return;
    } else if (!Types.ObjectId.isValid(`${id}`)) {
        res.status(400);
        res.json({ error: 'Id inválido' });
        return;
    }

    const adInfo = await AdService.getAdInfo(id as string);//console.log(ad)
    if (adInfo instanceof Error) {
        res.json({ error: adInfo.message });
        return;
    }

    let images = [];
    for (let i in adInfo.ad.images) {
        images.push(`${process.env.BASE}/media/${adInfo.ad.images[i].url}`);
    }

    let others = [];

    if (other) {
        const otherData = await AdService.getOtherAds(adInfo.ad.idUser);

        for (let i in otherData) {
            if (otherData[i]._id.toString() != adInfo.ad._id.toString()) {
                let image = `${process.env.BASE}/media/default.jpg`;

                let defaultImg = otherData[i].images.find(e => e.default);
                if (defaultImg) image = `${process.env.BASE}/media/${defaultImg.url}`;

                others.push({
                    id: otherData[i]._id,
                    title: otherData[i].title,
                    price: otherData[i].price,
                    priceNegotiable: otherData[i].priceNegotiable,
                    image
                });
            }
        }
    }

    res.json({
        id: adInfo.ad._id,
        title: adInfo.ad.title,
        price: adInfo.ad.price,
        priceNegotiable: adInfo.ad.priceNegotiable,
        description: adInfo.ad.description,
        dateCreated: adInfo.ad.dateCreated,
        views: adInfo.ad.views,
        images,
        category: adInfo.category,
        userInfo: {
            name: adInfo.user.name,
            email: adInfo.user.email
        },
        stateName: adInfo.state.name,
        others
    });
};

export const editAction = async (req: Request, res: Response) => {
    let { id } = req.params; // aqui deveria have um try
    let { title, status, price, priceNegotiable, description, category, images, delImages, token } = req.body;

    if (!Types.ObjectId.isValid(`${id}`)) {
        res.json({ error: 'Id inválido' });
        return;
    }

    const isValid = await AdService.validateEditAct(id, token);
    if (isValid instanceof Error) {
        res.status(400);
        res.json({ error: isValid.message });
        return;
    }

    let updates: any = {};

    if (title) updates.title = title;

    if (price) { // R$ 8.000,35 = 8000.35
        updates.price = parseFloat(
            price
                .replace(".", '')
                .replace(",", '.')
                .replace("R$ ", '')
        );
    }

    if (priceNegotiable) updates.priceNegotiable = priceNegotiable;

    if (status) updates.status = status;

    if (description) updates.description = description;

    if (category) {
        const dbCategory = await AdService.getDbCatBySlug(category);

        if (!dbCategory) {
            res.json({ error: "Categoria não existe" });
            return;
        }
        updates.category = dbCategory._id.toString();
    }

    // if (images) updates.images = images; // isso ñ faz sentido p mim
    // console.log(images)

    const files = req.files as Express.Multer.File[];

    const updated = await AdService.updateDbAd(id, updates, files, delImages);

    if (updated instanceof Error) {
        res.status(400);
        res.json({ error: updated.message });
        return;
    }

    res.json({ error: '' });
};