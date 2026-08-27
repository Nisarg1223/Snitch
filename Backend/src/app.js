import cookieParser from 'cookie-parser';
import express from 'express';
import authrouter from './routes/auth.route.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials:true,
}));
app.use('/api/auth',authrouter);
export default app;