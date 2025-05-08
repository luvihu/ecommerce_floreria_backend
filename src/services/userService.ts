import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { AppError } from "../utils/appError";
import { hashPassword, comparePasswords } from "../utils/passwordUtils";
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const getUserService = async () => {
  const users = await userRepository.find({
    order: { nombre: 'ASC' },
    select: ['id', 'nombre', 'apellido', 'email', 'telefono', 'rol','activo', 'fechaRegistro'],
    // relations: ['products'] 
  });
  // Formatear la fecha para cada usuario
  return users.map(user => ({
    ...user,
    fechaRegistro: formatDate(user.fechaRegistro)
  }));
};
// Función auxiliar para formatear la fecha
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};
export const getUserIdService = async (id: string) => {
  const user = await userRepository.findOne({
    where: { id },
    select: ['id', 'nombre', 'apellido', 'email', 'telefono', 'rol','activo', 'fechaRegistro'],
    // relations: ['products']
  });
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
};

export const registerUserService = async (userData: any) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verificar email único
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email: userData.email }
    });
    if (existingUser) throw new AppError('El email ya está registrado', 409);

    // Hash de contraseña
    const hashedPassword = await hashPassword(userData.password);

    // Crear usuario
    const newUser = queryRunner.manager.create(User, {
      ...userData,
      password: hashedPassword,
      rol: userData.rol || 'USER',
      activo: true
    });

    await queryRunner.manager.save(newUser);
    await queryRunner.commitTransaction();

    // Omitir password en la respuesta
    const { password, ...safeUser } = newUser;
    return safeUser;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const loginUserService = async (email: string, password: string) => {
  const user = await userRepository.findOne({
    where: { email, activo: true },
    select: ['id', 'nombre', 'email', 'password', 'rol']
  });

  if (!user) throw new AppError('Usuario no encontrado', 404);

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) throw new AppError('Contraseña incorrecta', 401);

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );
    // Omitir password en la respuesta
  const { password: _, ...userWithoutPassword } = user;
    
  return { 
    user: userWithoutPassword, 
    token, 
    rol: user.rol 
  };
};

export const updateUserService = async (id: string, userData: any) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user = await queryRunner.manager.findOne(User, { where: { id } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    // Actualizar solo campos permitidos
    const updatableFields: Array<keyof Pick<User, 'nombre' | 'apellido' | 'telefono' | 'email' | 'password' | 'activo' | 'rol'>> = 
    ['nombre', 'apellido', 'telefono', 'email', 'password', 'activo', 'rol'];
    
    updatableFields.forEach(field => {
      if (userData[field] !== undefined) {
        user[field] = userData[field] as never};
    });

    if (userData.password) {
      user.password = await hashPassword(userData.password);
    }

    await queryRunner.manager.save(user);
    await queryRunner.commitTransaction();

    // Omitir password en la respuesta
    const { password, ...updatedUser } = user;
    return updatedUser;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const deleteUserService = async (id: string) => {
  const result = await userRepository.update(id, { activo: false });
  return (result?.affected ?? 0 ) > 0;
};