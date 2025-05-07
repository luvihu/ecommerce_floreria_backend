import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { validateId, sendSuccessResponse } from "../utils/functions";
import {
  uploadImageService,
  getImageService,
  updateImageService,
  deleteImageService,
  setMainImageService, 
  getProductImagesService
} from "../services/imageService";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";

const productRepository = AppDataSource.getRepository(Product);

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { alt_text, principal } = req.body;
    
    // Verificar si el middleware processImage ha procesado una imagen
    if (!req.body.imageUrl) {
      return next(new AppError('Imagen es requerida', 400));
    }

    if (!validateId(productId)) {
      return next(new AppError('ID de producto inválido', 400));
    }

    // Verificar que el producto existe
    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
      return next(new AppError('Producto no encontrado', 404));
    }

    // Usar los datos procesados por el middleware processImage
    const imageData = {
      url: req.body.imageUrl,
      public_id: req.body.imagePublicId,
      alt_text: alt_text || `Imagen de ${product.nombre}`,
      principal: principal === 'true' || principal === true,
      product: { id: productId }
    };

    const newImage = await uploadImageService(imageData);
    sendSuccessResponse(res, newImage, 201);
  } catch (error) {
    next(error);
  }
};

export const getProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    if (!validateId(productId)) {
      return next(new AppError('ID de producto inválido', 400));
    }
    const images = await getProductImagesService(productId);
    sendSuccessResponse(res, images);
  } catch (error) {
    next(error);
  }
};

export const getIdImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de imagen inválido', 400));
    }
    const image = await getImageService(id);
    
    sendSuccessResponse(res, image);
     } catch (error) {
    next(error);
  }
};

export const updateImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de imagen inválido', 400));
    }
    
    const updates: any = { ...req.body };
    
    // Si el middleware processImage ha procesado una imagen
    if (req.body.imageUrl) {
      updates.url = req.body.imageUrl;
      updates.public_id = req.body.imagePublicId;
    }
    
    // Eliminar campos que no deben pasar al servicio
    delete updates.image; // Eliminar la imagen base64 si existe
    delete updates.imageUrl; // Eliminar campos temporales del middleware
    delete updates.imagePublicId; // Eliminar campos temporales del middleware
    
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No se proporcionaron datos para actualizar', 400));
    }

    // Validar campos actualizables
    if (updates.principal !== undefined && 
        typeof updates.principal !== 'boolean' && 
        updates.principal !== 'true' && 
        updates.principal !== 'false') {
      return next(new AppError('El campo principal debe ser booleano', 400));
    }
    
    // Convertir string a boolean si es necesario
    if (updates.principal === 'true') updates.principal = true;
    if (updates.principal === 'false') updates.principal = false;

    const updatedImage = await updateImageService(id, updates);
    sendSuccessResponse(res, updatedImage);
  } catch (error) {
    next(error);
  }
};

export const setMainImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, productId } = req.params;
    if (!validateId(id) || !validateId(productId)) {
      return next(new AppError('IDs inválidos', 400));
    }
    const result = await setMainImageService(id, productId);
    sendSuccessResponse(res, {
      message: result ? 'Imagen principal actualizada' : 'No se pudo actualizar'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!validateId(id)) {
      return next(new AppError('ID de imagen inválido', 400));
    }
    const result = await deleteImageService(id);
    sendSuccessResponse(res, {
      message: result ? 'Imagen eliminada' : 'No se pudo eliminar'
    });
  } catch (error) {
    next(error);
  }
};
