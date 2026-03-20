import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js'
import notFound from './middleware/notFound.js'
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
dotenv.config();
const app=express();
const PORT=process.env.PORT;
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/health',healthRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/roles',roleRoutes);

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