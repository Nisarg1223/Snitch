import {Router} from 'express';
import { validateRegisterUser } from '../validator/auth.validator.js';
import { RegisterController } from '../controllers/auth.controller.js';
const authrouter = Router();


authrouter.post('/register',validateRegisterUser,RegisterController);
export default authrouter;