import { Router } from "express";
import routerProducts from './routerProducts';
import routerUsers from './routerUsers';
import routerPromotions from './routerPromotions';
import routerCategories from './routerCategories';
import routerImage from './routerImage';
import routerAuth from './routerAuth';
import routerAdmin from './routerAdmin';

const router = Router();

router.use('/products', routerProducts);
router.use('/users', routerUsers);
router.use('/promotions', routerPromotions);
router.use('/categories', routerCategories);
router.use('/images', routerImage);
router.use('/verifyToken', routerAuth);

router.use('/admin', routerAdmin);

export default router;