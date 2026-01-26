import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import connnectedDB from './configs/db.js';
import categoryRoute from './routes/categoryRoute.js';
import shopRoute from './routes/shopRoute.js';
import router from './routes/deliveryCompanyRoute.js';
import route from './routes/userRoute.js';

const app = express();

const PORT = process.env.PORT || 5001;

const allowedOrigin = ['http://localhost:5173'];

await connnectedDB();


app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: allowedOrigin }))

app.use('/api/category', categoryRoute);
app.use('/api/shop', shopRoute);
app.use('/api/user', route)
app.use('/api/company', router)

app.get('/', (req, res) => res.send('API is working'));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));