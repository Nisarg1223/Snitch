import cookieParser from 'cookie-parser';
import express from 'express';
import authrouter from './routes/auth.route.js';
import passport from 'passport';
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import { config } from './config/config.js';
const app = express();
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//     origin:'http://localhost:5173',
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials:true,
// }));
app.use(passport.initialize());
app.use(new GoogleStrategy({
    clientID:config.GOOGLE_CLIENT_ID,
    clientSecret:config.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback"
},(accessToken,refreshToken,profile,done)=>{
    return done(null, profile)
}))
app.use('/api/auth',authrouter);
export default app;