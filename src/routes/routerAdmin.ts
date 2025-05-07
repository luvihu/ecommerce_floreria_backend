import { Router } from 'express';
import { isAdmin, authMiddleware } from '../middlewares/authMiddleware';
import { getDashboard } from '../controllers/dashboardController';

const routerAdmin = Router();

routerAdmin.get('/', getDashboard);

export default routerAdmin;