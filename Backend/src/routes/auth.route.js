import { Router } from 'express';
import passport from 'passport';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import {
    RegisterController,
    LoginController,
    googleCallback,
    getMeController,
    LogoutController
} from '../controllers/auth.controller.js';

const authrouter = Router();

authrouter.post('/register', validateRegisterUser, RegisterController);
authrouter.post('/login', validateLoginUser, LoginController);
authrouter.get('/me', getMeController);
authrouter.post('/logout', LogoutController);
authrouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authrouter.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

export default authrouter;