import { Router } from "express";
import { listCategories, getIdCategory, addCategory, modifyCategory, removeCategory} from "../controllers/categoryController";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";

const routerCategories = Router();

routerCategories.get('/', listCategories)
routerCategories.get('/:id', getIdCategory)
routerCategories.post('/create', authMiddleware, isAdmin, addCategory)
routerCategories.put('/:id', authMiddleware, isAdmin, modifyCategory)
routerCategories.delete('/:id', authMiddleware, isAdmin, removeCategory)

export default routerCategories;