import express, { ErrorRequestHandler, Request, Response } from 'express';
import { MulterError } from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import mainRoutes from './routes/mainRoutes';
import { mongoConnect } from './database/mongo';

dotenv.config();

mongoConnect();

const server = express();

server.use(cors());
server.use(express.json());

server.use(express.static(path.join(__dirname, '../public')));

server.use(express.urlencoded({ extended: true }));

server.use(mainRoutes);

server.use((req: Request, res: Response) => {
    res.status(404).send('Página não encontrada!');
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => { 
    res.status(400); 

    if (err instanceof MulterError) { 
        res.json({ error: err.message }); 
    } else { 
        console.log(err); 
        res.json({ error: err.message });
    }
}
server.use(errorHandler);

server.listen(process.env.PORT);