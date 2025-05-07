import { AppDataSource } from "../config/database";
import { Promotion } from "../entities/Promotion";
import { Product } from "../entities/Product";
import { AppError } from "../utils/appError";
import { In } from "typeorm";

const promotionRepository = AppDataSource.getRepository(Promotion);
const productRepository = AppDataSource.getRepository(Product);

export const createPromotionService = async (promotionData: {
  nombre: string;
  descripcion?: string;
  valor: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo: boolean;
  products?: { id: string }[];
}) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verificar productos existentes
    let products: Product[] = [];
    if (promotionData.products && promotionData.products.length > 0) {
      products = await productRepository.findBy({
        id: In(promotionData.products.map(p => p.id))
      });
      if (products.length !== promotionData.products.length) {
        throw new AppError('Algunos productos no existen', 400);
      }
    }

    const newPromotion = queryRunner.manager.create(Promotion, {
      ...promotionData,
      tipo: 'porcentaje', // Tipo fijo
      products
    });

    await queryRunner.manager.save(newPromotion);
    await queryRunner.commitTransaction();

    return await queryRunner.manager.findOne(Promotion, {
      where: { id: newPromotion.id },
      relations: ['products']
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const getPromotionsService = async (activeOnly: boolean = true) => {
  return await promotionRepository.find({
    where: activeOnly ? { activo: true } : {},
    order: { fecha_inicio: 'DESC' },
    relations: ['products'],
    select: {
      products: {
        id: true,
        nombre: true,
        precio: true,
        activo: true
      }
    }
  });
};

export const getPromotionByIdService = async (id: string) => {
  const promotion = await promotionRepository.findOne({
    where: { id },
    relations: ['products']
  });

  if (!promotion) {
    throw new AppError('Promoción no encontrada', 404);
  }
  return promotion;
};

export const updatePromotionService = async (id: string, updates: Partial<Omit<Promotion, 'tipo'>>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const promotion = await queryRunner.manager.findOne(Promotion, { 
      where: { id },
      relations: ['products']
    });

    if (!promotion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    // Campos actualizables (excluyendo 'tipo')
    const updatableFields: Array<keyof Omit<Promotion, 'tipo'>> = [
      'nombre', 'descripcion', 'valor', 
      'fecha_inicio', 'fecha_fin', 'activo'
    ];

    updatableFields.forEach(field => {
      if (updates[field] !== undefined) {
        (promotion as any)[field] = updates[field];
      }
    });

    await queryRunner.manager.save(promotion);
    await queryRunner.commitTransaction();

    return promotion;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const deactivatePromotionService = async (id: string) => {
  const result = await promotionRepository.update(id, { activo: false });
  return result.affected === 1;
};

export const applyPromotionToProductsService = async (promotionId: string, productIds: string[]) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Verificar que la promoción existe
    const promotion = await queryRunner.manager.findOne(Promotion, {
      where: { id: promotionId },
      relations: ['products'] // Cargar productos relacionados
    });
    if (!promotion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    // 2. Verificar que los productos existen
    const products = await queryRunner.manager.findBy(Product, {
      id: In(productIds)
    });
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new AppError(`Los siguientes productos no existen: ${missingIds.join(', ')}`, 400);
    }

     // 3. Eliminar relaciones existentes primero (opcional, depende de tu lógica de negocio)
     promotion.products = [];
     await queryRunner.manager.save(promotion);
 
     // 4. Añadir las nuevas relaciones
     promotion.products = products;
     await queryRunner.manager.save(promotion);

    await queryRunner.commitTransaction();

    return { 
      affected: productIds.length,
      promotion: {
        id: promotion.id,
        nombre: promotion.nombre,
        valor: promotion.valor
      } };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};