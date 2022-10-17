import multer from 'multer';
import { v4 as uuidV4 } from 'uuid';
import { unlink } from "fs/promises";
import sharp from "sharp";
import { readdir } from 'fs';

const storageConfig = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './tmp');
    },
    filename(req, file, callback) {
        callback(null, `${uuidV4()}.jpg`);
    }
});

export const upload = multer({
    fileFilter(req, file, callback) {
        const allowed = ['image/jpg', 'image/jpeg', 'image/png'];

        allowed.includes(file.mimetype)
            ? callback(null, allowed.includes(file.mimetype))
            : callback(new Error("Extensão inválida"));
    },
    limits: { fieldSize: 2000000 },
    storage: storageConfig
});

export const handleImages = async (files: Express.Multer.File[]) => {
    let images = [];
    for (let i = 0; i < files.length; i++) {
        await sharp(files[i].path)
            .resize(500, 500)
            .toFormat('jpeg')
            .toFile(`./public/media/${files[i].filename}`)

        // await unlink(files[i].path);

        const url = files[i].filename;

        images.push({
            url,
            default: false
        });
    }
    return images;
}

export const cleanTmpDir = () => {
    readdir('./tmp', (_, arquivos) => {
        arquivos.forEach(async (arquivo) => {
            await unlink(`./tmp/${arquivo}`);
        });
    });
}