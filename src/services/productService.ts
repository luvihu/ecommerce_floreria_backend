import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { AppError } from '../utils/appError';
import { In } from 'typeorm';

const productRepository = AppDataSource.getRepository(Product);

export const getProducts = async () => {
  return await productRepository.find({
    order: { nombre: 'ASC' },
    relations: {
      categories: true,
      user: true,
      images: true,
      promotions: true
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precio: true,
      activo: true,
      fechaCreacion: true,
      user: { id: true, nombre: true },
      categories: { id: true, nombre: true, activa: true },
      images: { id: true, url: true }
    }
  });
};

export const getIdProducts = async (id: string) => {
  const product = await productRepository.findOne({
    where: { id },
    relations: ['categories', 'user', 'images', 'promotions'],
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precio: true,
      activo: true,
      fechaCreacion: true,
      user: { id: true, nombre: true },
      categories: { id: true, nombre: true },
      images: { id: true, url: true },
    }
  });

  if (!product) throw new AppError('Producto no encontrado', 404);
  return product;
};

export const postProducts = async (productData: Partial<Product>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verificar categorías existentes
    if (productData.categories) {
      const categories = await queryRunner.manager.findBy('Category', {
        id: In(productData.categories.map(c => c.id))
      });
      if (categories.length !== productData.categories.length) {
        throw new AppError('Una o más categorías no existen', 400);
      }
    }

    const newProduct = queryRunner.manager.create(Product, {
      ...productData,
      activo: productData.activo ?? true,
      fechaCreacion: new Date()
    });

    await queryRunner.manager.save(newProduct);
    await queryRunner.commitTransaction();

    return await queryRunner.manager.findOne(Product, {
      where: { id: newProduct.id },
      relations: ['categories', 'images', 'promotions', 'user']
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const putProducts = async (id: string, productData: Partial<Product>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const product = await queryRunner.manager.findOne(Product, { 
      where: { id },
      relations: ['categories', 'images', 'promotions']
    });
    if (!product) throw new AppError('Producto no encontrado', 404);

    // Campos actualizables
    const updatableFields: Array<keyof Product> = [
      'nombre', 'descripcion', 'precio', 'activo'
    ];

    updatableFields.forEach(field => {
      if (productData[field] !== undefined) {
        (product as any)[field] = productData[field];
      }
    });

    // Actualizar relaciones si se proporcionan
    if (productData.categories) {
      product.categories = productData.categories as any;
    };
    if (productData.promotions) {
      product.promotions = productData.promotions as any;
    };

    await queryRunner.manager.save(product);
    await queryRunner.commitTransaction();

    // Devolver el producto actualizado con todas sus relaciones
    return await queryRunner.manager.findOne(Product, {
      where: { id: product.id },
      relations: ['categories', 'images', 'promotions', 'user']
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const deleteProducts = async (id: string): Promise<boolean> => {
  const result = await productRepository.update(id, { activo: false });
  return (result?.affected ?? 0) > 0;

};