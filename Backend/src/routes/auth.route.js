import {Router} from 'express';
import { validateRegisterUser } from '../validator/auth.validator.js';
const authrouter = Router();


authrouter.post('/register',validateRegisterUser)
export default authrouter;