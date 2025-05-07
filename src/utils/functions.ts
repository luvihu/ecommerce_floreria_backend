import { Response } from 'express';


export const validateId = (id: string): boolean => {
  const validId = typeof id == 'string' && id.trim() !== '';
  return validId;
};

export const sendSuccessResponse = (res: Response, data: any, statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};