import express from 'express';
import { createCategory } from '../controller/categoryController.js';

const categoryRoute = express.Router();

categoryRoute.post('/create', createCategory);

export default categoryRoute;