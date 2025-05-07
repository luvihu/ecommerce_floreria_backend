import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
 const statusCode = err.statusCode || 500;
 
 res.status(statusCode).json({
  success: false,
  error: err.message || "Error del servidor",
  stack: process.env.NODE_ENV === "development" ? err.stack : undefined
 });
};

export default errorHandler;




