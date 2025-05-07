import { Request, Response, NextFunction } from "express";
import { CloudinaryService } from "../services/cloudinaryService";
import { AppError } from "../utils/appError";

export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.image) {
      return next();
    };
     // Validar que la imagen sea una cadena base64 válida
     if (typeof req.body.image !== 'string' || !req.body.image.includes('base64')) {
      return next(new AppError('Formato de imagen inválido. Debe ser base64', 400));
    }
    // La imagen viene como base64 desde el frontend
    const base64Image = req.body.image;
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Subir a Cloudinary
    const result: any = await CloudinaryService.uploadImage(buffer);

    // Reemplazar la imagen base64 con la URL de Cloudinary
    req.body.imageUrl = result.secure_url;
    req.body.imagePublicId = result.public_id;

     // Eliminar la imagen base64 original para no sobrecargar la solicitud
     delete req.body.image;

    next();
  } catch (error) {
    next(error);
  }
};
