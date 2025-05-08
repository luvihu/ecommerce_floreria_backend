// Extensiones de tipos para módulos existentes
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: any; // Extiende el tipo Request de Express
    }
  }
}

// Corrección para Number.parseInt
interface NumberConstructor {
  parseInt(string: string, radix?: number): number;
}