import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { validateId, sendSuccessResponse } from "../utils/functions";
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deactivateCategory 
} from "../services/categoryService";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getAllCategories();
    sendSuccessResponse(res, categories);
  } catch (error) {
    next(error);
  }
};

export const getIdCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de categoría inválido', 400));
    }
    const category = await getCategoryById(id);
    sendSuccessResponse(res, category);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return next(new AppError('El nombre de la categoría es requerido', 400));
    }

    // Normalizar nombre (primera letra mayúscula)
    const normalizedName = nombre.trim().charAt(0).toUpperCase() + nombre.trim().slice(1).toLowerCase();

    const newCategory = await createCategory({
      nombre: normalizedName,
      activa: true
    });

    sendSuccessResponse(res, newCategory, 201);
  } catch (error) {
    next(error);
  }
};

export const modifyCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de categoría inválido', 400));
    }

    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No se proporcionaron datos para actualizar', 400));
    }

    // Normalizar nombre si viene en los updates
    if (updates.nombre) {
      updates.nombre = updates.nombre.trim().charAt(0).toUpperCase() + 
                      updates.nombre.trim().slice(1).toLowerCase();
    }

    const updatedCategory = await updateCategory(id, updates);
    sendSuccessResponse(res, updatedCategory);
  } catch (error) {
    next(error);
  }
};

export const removeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de categoría inválido', 400));
    }

    const result = await deactivateCategory(id);
    sendSuccessResponse(res, { 
      message: `Categoría ${result ? 'desactivada' : 'no encontrada'}` 
    });
  } catch (error) {
    next(error);
  }
};