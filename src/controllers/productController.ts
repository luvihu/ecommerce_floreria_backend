import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { validateId, sendSuccessResponse } from "../utils/functions";
import { 
  getProducts, 
  getIdProducts, 
  deleteProducts, 
  putProducts, 
  postProducts 
} from "../services/productService";
import { AppDataSource } from "../config/database";
import {Category} from "../entities/Category";
import {User} from "../entities/User";
import { Promotion } from "../entities/Promotion";
import { In } from "typeorm";

const categoryRepository = AppDataSource.getRepository(Category);
const userRepository = AppDataSource.getRepository(User);
const promotionRepository = AppDataSource.getRepository(Promotion);

export const allProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await getProducts();
    sendSuccessResponse(res, products);
  } catch (error) {
    next(error);
  }
};

export const idProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de producto inválido', 400));
    }
    const product = await getIdProducts(id);
    sendSuccessResponse(res, product);
  } catch (error) {
    next(error);
  }
};

export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      nombre, 
      descripcion, 
      precio, 
      categoryIds = [], 
      userId,
      promotionIds = []
    } = req.body;

    // Validación básica
    if (!nombre?.trim() || !precio || precio <= 0) {
      return next(new AppError('Datos de producto inválidos. Nombre y precio son obligatorios', 400));
    }

    // Validación de categorías
    if (!Array.isArray(categoryIds)) {
      return next(new AppError('Formato de categorías inválido', 400));
    }

    // Obtener categorías completas
    const categories = await categoryRepository.findBy({
      id: In(categoryIds)
    });
    
    if (categories.length !== categoryIds.length) {
      return next(new AppError('Una o más categorías no existen', 400));
    }

    // Obtener usuario si se proporcionó
    let user: User | undefined = undefined;
    if (userId) {
      const foundUser = await userRepository.findOneBy({ id: userId });
      if (!foundUser) {
        return next(new AppError('Usuario no encontrado', 404));
      }
      user = foundUser; // Asignamos sólo si existe
    };
    // Obtener promociones si se proporcionaron
    let promotions: Promotion[] = [];
    if (promotionIds && promotionIds.length > 0) {
      promotions = await promotionRepository.findBy({
        id: In(promotionIds)
      });
      
      if (promotions.length !== promotionIds.length) {
        return next(new AppError('Una o más promociones no existen', 400));
      }
    }

    const newProduct = await postProducts({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
      precio: Number(precio),
      categories,
      user,
      promotions
    });

    sendSuccessResponse(res, newProduct, 201);
  } catch (error) {
    next(error);
  }
};

export const editProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de producto inválido', 400));
    }

    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No se proporcionaron datos para actualizar', 400));
    }

    // Validación de actualización
    if (updates.precio !== undefined && updates.precio <= 0) {
      return next(new AppError('El precio debe ser mayor que cero', 400));
    }

     // Manejo de categorías si se envían
    if (updates.categoryIds) {
      updates.categories = await categoryRepository.findBy({
        id: In(updates.categoryIds)
      });
      delete updates.categoryIds;
    };
    // Manejo de promociones si se envían
    if (updates.promotionIds) {
      updates.promotions = await promotionRepository.findBy({
        id: In(updates.promotionIds)
      });
      delete updates.promotionIds;
    };

    const updatedProduct = await putProducts(id, updates);
    sendSuccessResponse(res, updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const delProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de producto inválido', 400));
    }

    const result = await deleteProducts(id);
    sendSuccessResponse(res, { 
      message: `Producto ${result ? 'desactivado' : 'no encontrado'}` 
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products
// includeInactive será 'false' (valor por defecto)

// includeInactive === 'true' → false

// Solo muestra productos activos

// URL con parámetro true:


// GET /api/products?includeInactive=true
// includeInactive será 'true'

// includeInactive === 'true' → true

// Muestra todos los productos (activos e inactivos)

// URL con parámetro false:


// GET /api/products?includeInactive=false
// includeInactive será 'false'

// includeInactive === 'true' → false

// Solo muestra productos activos