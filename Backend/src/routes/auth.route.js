import {Router} from 'express';
import { validateRegisterUser } from '../validator/auth.validator.js';
import { RegisterController,LoginController } from '../controllers/auth.controller.js';
import { validateLoginUser } from '../validator/auth.validator.js';

const authrouter = Router();


authrouter.post('/register',validateRegisterUser,RegisterController);
authrouter.post('/login',validateLoginUser,LoginController);
export default authrouter;