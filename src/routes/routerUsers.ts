import { Router } from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";
import { getUsers, getUserId, deactivateUser, updateUser, registerUser, loginUser } from "../controllers/userController";

const routerUsers = Router();

routerUsers.get('/',authMiddleware, isAdmin, getUsers);

routerUsers.post('/register', registerUser);
routerUsers.post('/login', loginUser);

routerUsers.get('/:id', getUserId);
routerUsers.put('/:id', updateUser);
routerUsers.delete('/:id', authMiddleware, isAdmin, deactivateUser);

export default routerUsers;
