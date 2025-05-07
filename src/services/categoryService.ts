import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";
import { AppError } from "../utils/appError";

const categoryRepository = AppDataSource.getRepository(Category);

export const getAllCategories = async () => {
  return await categoryRepository.find({
    order: { nombre: 'ASC' },
    relations: ['products'],
    select: {
      id: true,
      nombre: true,
      activa: true,
      products: {
        id: true,
        nombre: true,
        activo: true
      }
    }
  });
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepository.findOne({
    where: { id },
    relations: ['products']
  });

  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }
  return category;
};

export const createCategory = async (categoryData: Partial<Category>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verificar si la categoría ya existe
    const existingCategory = await queryRunner.manager.findOne(Category, {
      where: { nombre: categoryData.nombre }
    });

    if (existingCategory) {
      throw new AppError('Ya existe una categoría con este nombre', 409);
    }

    const newCategory = queryRunner.manager.create(Category, categoryData);
    await queryRunner.manager.save(newCategory);
    await queryRunner.commitTransaction();

    return newCategory;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const updateCategory = async (id: string, categoryData: Partial<Category>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const category = await queryRunner.manager.findOne(Category, { 
      where: { id },
      relations: ['products']
    });

    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Campos actualizables
    const updatableFields: Array<keyof Category> = ['nombre', 'activa' ];

    updatableFields.forEach(field => {
      if (categoryData[field] !== undefined) {
        (category as any)[field] = categoryData[field];
      }
    });

    await queryRunner.manager.save(category);
    await queryRunner.commitTransaction();

    return category;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const deactivateCategory = async (id: string): Promise<boolean> => {
  const result = await categoryRepository.update(id, { activa: false });
  return (result?.affected ?? 0) > 0;
};