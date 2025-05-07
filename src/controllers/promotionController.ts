import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { validateId, sendSuccessResponse } from "../utils/functions";
import { 
  createPromotionService,
  getPromotionsService,
  getPromotionByIdService,
  updatePromotionService,
  deactivatePromotionService,
  applyPromotionToProductsService
} from "../services/promotionService";

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      nombre, 
      descripcion, 
      valor, 
      fecha_inicio, 
      fecha_fin,
      productIds = []
    } = req.body;

    // Validación básica
    if (!nombre || !valor || !fecha_inicio || !fecha_fin) {
      return next(new AppError('Nombre, valor y fechas son obligatorios', 400));
    }

    // Validación específica para porcentaje
    if (valor <= 0 || valor > 100) {
      return next(new AppError('El porcentaje debe estar entre 0 y 100', 400));
    }

    // Validación de fechas
    const startDate = new Date(fecha_inicio);
    const endDate = new Date(fecha_fin);
    
    if (startDate >= endDate) {
      return next(new AppError('La fecha de inicio debe ser anterior a la fecha fin', 400));
    }

    const newPromotion = await createPromotionService({
      nombre,
      descripcion,
      valor,
      fecha_inicio: startDate,
      fecha_fin: endDate,
      activo: true,
      products: productIds.map((id: string) => ({ id }))
    });

    sendSuccessResponse(res, newPromotion, 201);
  } catch (error) {
    next(error);
  }
};

export const getPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activeOnly = 'true' } = req.query;
    const promotions = await getPromotionsService(activeOnly === 'true');
    sendSuccessResponse(res, promotions);
  } catch (error) {
    next(error);
  }
};

export const getIdPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de promoción inválido', 400));
    }
    const promotion = await getPromotionByIdService(id);
    sendSuccessResponse(res, promotion);
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de promoción inválido', 400));
    }

    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No se proporcionaron datos para actualizar', 400));
    }

    // Validación específica si actualizan el valor
    if (updates.valor !== undefined && (updates.valor <= 0 || updates.valor > 100)) {
      return next(new AppError('El porcentaje debe estar entre 0 y 100', 400));
    }

    // Validación de fechas
    if (updates.fecha_inicio && updates.fecha_fin) {
      const startDate = new Date(updates.fecha_inicio);
      const endDate = new Date(updates.fecha_fin);
      
      if (startDate >= endDate) {
        return next(new AppError('La fecha de inicio debe ser anterior a la fecha fin', 400));
      }
    }

    // Fuerza el tipo a "porcentaje"
    if (updates.tipo && updates.tipo !== 'porcentaje') {
      return next(new AppError('Solo se permiten promociones de tipo porcentaje', 400));
    }

    const updatedPromotion = await updatePromotionService(id, {
      ...updates,
      tipo: 'porcentaje' // Sobrescribe cualquier intento de cambiar el tipo
    });

    sendSuccessResponse(res, updatedPromotion);
  } catch (error) {
    next(error);
  }
};

export const deactivatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de promoción inválido', 400));
    }

    const result = await deactivatePromotionService(id);
    sendSuccessResponse(res, { 
      message: `Promoción ${result ? 'desactivada' : 'no encontrada'}` 
    });
  } catch (error) {
    next(error);
  }
};

export const applyToProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    
    if (!validateId(id) || !Array.isArray(productIds)) {
      return next(new AppError('Datos inválidos', 400));
    }

    const result = await applyPromotionToProductsService(id, productIds);
    sendSuccessResponse(res, {
      message: `Promoción aplicada a ${result.affected} productos`
    });
  } catch (error) {
    next(error);
  }
};