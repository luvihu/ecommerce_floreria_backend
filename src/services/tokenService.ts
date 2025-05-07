import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { AppError } from '../utils/appError';

const tokenRepository = AppDataSource.getRepository(User);

const getTokenService = async (userIdDecoded: string) => {
  const user = await tokenRepository.findOne({
    where: { id: userIdDecoded }
  });
  if(!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
   return user;
};

export default getTokenService;