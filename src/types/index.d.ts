// Declaraciones para módulos sin tipos
declare module 'express' {
  import { IncomingHttpHeaders } from 'http';
  
  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: IncomingHttpHeaders & {
      authorization?: string;
    };
    user?: any;
  }
  
  export interface Response {
    status(code: number): Response;
    json(data: any): Response;
    send(data: any): Response;
  }
  
  export type NextFunction = (err?: any) => void;
  
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;
  
  // Interfaz para las opciones de urlencoded
  interface UrlEncodedOptions {
    extended: boolean;
    limit?: string | number;
    // Añade otras propiedades según sea necesario
  }
  
  // Interfaz para las opciones de json
  interface JsonOptions {
    limit?: string | number;
    // Añade otras propiedades según sea necesari
  }
  
  export function Router(): any;
  
  function express(): any;
  namespace express {
    export function json(options?: JsonOptions): any;
    export function urlencoded(options: UrlEncodedOptions): any;
    export function Router(): any;
  }
  
  export default express;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secretOrPrivateKey: string, options?: any): string;
  export function verify(token: string, secretOrPublicKey: string, options?: any): any;
}

declare module 'cors' {
  interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }
  
  function cors(options?: CorsOptions): any;
  export default cors;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export default morgan;
}

declare module 'bcryptjs' {
  export function genSalt(rounds?: number): Promise<string>;
  export function hash(data: string, salt: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}
// Corrección para Number.parseInt
interface NumberConstructor {
  parseInt(string: string, radix?: number): number;
}