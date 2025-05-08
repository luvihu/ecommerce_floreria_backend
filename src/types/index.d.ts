import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare global {
  namespace Express {
    // Extender la interfaz Request
    interface Request extends ExpressRequest {
      user?: any; // Para almacenar el usuario autenticado
    }
  }
}

// Redefinir los tipos de Express para incluir las propiedades que necesitas
declare module 'express' {
  interface Request<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
  > {
    body: ReqBody;
    params: P;
    query: ReqQuery;
    headers: {
      authorization?: string;
      [key: string]: string | string[] | undefined;
    };
    user?: any;
  }
}

// Corrección para Number.parseInt si es necesario
interface NumberConstructor {
  parseInt(string: string, radix?: number): number;
}
