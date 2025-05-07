import { Router } from "express";
import { createPromotion, getPromotions, getIdPromotions, updatePromotion, deactivatePromotion, applyToProducts } from "../controllers/promotionController";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";
const routerPromotions = Router();

routerPromotions.post('/create', authMiddleware, isAdmin, createPromotion);
routerPromotions.get('/', getPromotions)
routerPromotions.get('/:id', getIdPromotions)
routerPromotions.put('/:id', authMiddleware, isAdmin, updatePromotion);
routerPromotions.delete('/:id', authMiddleware, isAdmin, deactivatePromotion);
routerPromotions.post('/:id/apply', authMiddleware, isAdmin, applyToProducts);  // Aplica la promoción a productos específicos

export default routerPromotions;