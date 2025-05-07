import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import getAuthToken from "../controllers/authTokenController";

const routerAuth = Router();

routerAuth.get('/', authMiddleware, getAuthToken);

export default routerAuth;