import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js'
import notFound from './middleware/notFound.js'
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
dotenv.config();
const app=express();
const PORT=process.env.PORT;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/health',healthRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/roles',roleRoutes);
app.use('/api/oauth',oauthRoutes);

app.get("/",(req,res)=>{
    res.json({
       name:'Backend',
       status:'running'
    })
})

app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
export default app;