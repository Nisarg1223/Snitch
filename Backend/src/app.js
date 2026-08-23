import cookieParser from 'cookie-parser';
import express from 'express';
import authrouter from './routes/auth.route.js';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authrouter);
export default app;