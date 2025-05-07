import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Definir una interfaz extendida para Request
interface RequestWithUser extends Request {
  user?: any;
}
export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
    try {
     // Obtener el token del header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({ 
         message: 'No se proporcionó un token de autenticación válido' 
       });
     }
     const token = authHeader.split(' ')[1];
     try {
     // Verificar el token
    const decoded = jwt.verify(token, 'secret_key') as { id: string; rol: string }; // Usar la variable de entorno
    (req as RequestWithUser).user = decoded;  // Aquí asignas usuario decodificado a req.body.userId
    next();
  } catch (jwtError: any) {
     return res.status(401).json({ 
      message: 'Token de autenticación inválido',
      error: jwtError.message
    });
  }
  } catch (error: any) {
     return res.status(401).json({ 
      message: 'Error en el proceso de autenticación',
      error: error.message
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): any => {
  const reqAdmin = (req as RequestWithUser).user;
    if (!reqAdmin || reqAdmin.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
};