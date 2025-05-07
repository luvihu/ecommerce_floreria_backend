import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import getTokenService from "../services/tokenService";

// Definir una interfaz extendida para Request
interface RequestWithUser extends Request {
  user?: any;
}

const getAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Usar la aserción de tipo para acceder a req.user
    const user = (req as RequestWithUser).user;
    
    if (!user || !user.id) {
      return next(new AppError('Token inválido o información de usuario no disponible', 401));
    }
    
    console.log('ID de usuario extraído del token:', user.id);
    
    // Obtener información completa del usuario desde la base de datos
    const userInfo = await getTokenService(user.id);
    
    res.status(200).json({
      success: true,
      user: userInfo
    });
  } catch (error) {
    console.error('Error en getAuthToken:', error);
    next(error);
  }
};

export default getAuthToken;
