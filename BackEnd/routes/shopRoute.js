import { createShop } from "../controller/shopController.js";
import express from 'express';

const shopRoute = express.Router();

shopRoute.post('/create', createShop);

export default shopRoute;