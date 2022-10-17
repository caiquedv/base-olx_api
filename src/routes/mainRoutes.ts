import { Router } from 'express';
import { upload } from '../helpers/MulterAndSharp';
import * as UserController from '../controllers/UserController';
import * as AuthController from '../controllers/AuthController';
import * as AdsController from '../controllers/AdsController';
import { Auth } from '../middlewares/Auth';
import { AuthValidator } from '../middlewares/validators/AuthValidator';
import { UserValidator } from '../middlewares/validators/UserValidator';

const router = Router();

router.get('/ping', (_, res) => { res.json({ pong: true }) });

router.get('/states', Auth.private, UserController.listStates);

router.post('/user/signin', AuthValidator.signIn, AuthController.signIn);
router.post('/user/signup', AuthValidator.signUp, AuthController.signUp);

router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction);

router.get('/categories', AdsController.getCategories);

router.post('/ad/add', upload.array('img'), Auth.private, AdsController.addAction);
router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem); // nessa rota o prof disse que faria com /ad/:id
router.post('/ad/:id', upload.array('img'), Auth.private, AdsController.editAction);


export default router;