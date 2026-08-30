import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/user.model.js';
import authrouter from './routes/auth.route.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SEC,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. Try to find the user by their Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    // Get the email from the Google profile
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';

    if (!user) {
      // 2. If Google ID not found, check if a user already exists with the same email
      if (email) {
        user = await User.findOne({ email });
      }

      if (user) {
        // Link Google ID to existing email account
        user.googleId = profile.id;
        if (!user.avatar) {
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
        }
        await user.save();
      } else {
        // 3. Create a brand new user if neither Google ID nor email exists
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          fullname: profile.displayName,
          email: email,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        });
      }
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Route to initiate Google OAuth flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route that Google will redirect to after authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate a JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user._id, displayName: req.user.displayName, fullname: req.user.fullname, email: req.user.email }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key_here', 
      { expiresIn: '1h' }
    );
    // Redirect to the frontend Home page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

// Also mount on /api/auth for API compatibility
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, displayName: req.user.displayName, fullname: req.user.fullname, email: req.user.email }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key_here', 
      { expiresIn: '1h' }
    );
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

app.use('/api/auth', authrouter);

export default app;