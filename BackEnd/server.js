import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import connnectedDB from './configs/db.js';
import categoryRouter from './routes/categoryRoute.js';
import companyRouter from './routes/deliveryCompanyRoute.js';
import userRouter from './routes/userRoute.js';
import shopRouter from './routes/shopRoute.js';
import menuRouter from './routes/menuRoute.js';
import router from './routes/orderRoute.js';
import phoneRouter from './routes/phoneCalledOrderRoute.js';


const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigin = ['http://localhost:5173'];

await connnectedDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: allowedOrigin }))

app.use('/api/category', categoryRouter);
app.use('/api/shop', shopRouter);
app.use('/api/user', userRouter)
app.use('/api/menu', menuRouter)
app.use('/api/company', companyRouter)
app.use('/api/order', router)
app.use('/api/phoneCalledOrder', phoneRouter)


app.get('/', (req, res) => res.send('API is working'));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));