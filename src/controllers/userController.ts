import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../utils/appError";
import { 
  getUserService, 
  getUserIdService, 
  deleteUserService, 
  updateUserService, 
  registerUserService, 
  loginUserService 
} from "../services/userService";
import { validateId, sendSuccessResponse } from "../utils/functions";
import validator from "validator";

// Middleware de validación común
const validateUserInput = (req: Request, next: NextFunction, forUpdate: boolean = false) => {
  const { nombre, apellido, telefono, email, password } = req.body;
  
  if (!forUpdate || nombre) {
    if (!nombre?.trim() || nombre.length < 2) {
      return next(new AppError('Nombre debe tener al menos 2 caracteres', 400));
    }
    req.body.nombre = formatName(nombre);
  }

  if (!forUpdate || apellido) {
    if (!apellido?.trim() || apellido.length < 2) {
      return next(new AppError('Apellido debe tener al menos 2 caracteres', 400));
    }
    req.body.apellido = formatName(apellido);
  }

  if (!forUpdate || telefono) {
    if (telefono && !validator.isMobilePhone(telefono, 'es-PE')) {
      return next(new AppError('Teléfono inválido', 400));
    }
    req.body.telefono = telefono?.trim();
  }

  if (!forUpdate || email) {
    if (email && !validator.isEmail(email)) {
      return next(new AppError('Email inválido', 400));
    }
    req.body.email = email?.trim().toLowerCase();
  }

  if (!forUpdate && (!password || password.length < 6)) {
    return next(new AppError('La contraseña debe tener al menos 6 caracteres', 400));
  }
};

const formatName = (name: string): string => {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
};

export const getUsers: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUserService();
    sendSuccessResponse(res, users);
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateUserInput(req, next);
    const newUser = await registerUserService(req.body);
    sendSuccessResponse(res, newUser, 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Email y contraseña son requeridos', 400));
    }
    const result = await loginUserService(email.trim().toLowerCase(), password.trim());
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUserId: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateId(req.params.id)) {
      return next(new AppError('ID de usuario inválido', 400));
    }
    const user = await getUserIdService(req.params.id);
    sendSuccessResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateId(req.params.id)) {
      return next(new AppError('ID de usuario inválido', 400));
    }
    validateUserInput(req, next, true);
    const userData = req.body;
    const updatedUser = await updateUserService(req.params.id, userData);
    sendSuccessResponse(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deactivateUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!validateId(req.params.id)) {
      return next(new AppError('ID de usuario inválido', 400));
    }
    const result = await deleteUserService(req.params.id);
    sendSuccessResponse(res, { message: `Usuario ${result ? 'desactivado' : 'no encontrado'}` });
  } catch (error) {
    next(error);
  }
};