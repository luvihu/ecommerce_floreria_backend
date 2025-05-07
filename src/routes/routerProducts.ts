import { Router } from "express";
import { allProducts, idProducts, createProducts, editProducts, delProducts } from "../controllers/productController";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";
const routerProducts = Router();

routerProducts.get("/", allProducts);
routerProducts.get("/:id", idProducts);
routerProducts.post("/create", authMiddleware, isAdmin, createProducts);
routerProducts.put("/:id", authMiddleware, isAdmin, editProducts);
routerProducts.delete("/:id", authMiddleware, isAdmin, delProducts);

export default routerProducts;

