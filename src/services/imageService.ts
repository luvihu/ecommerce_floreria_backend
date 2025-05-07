import { AppDataSource } from "../config/database";
import { Image } from "../entities/Image";
import { AppError } from "../utils/appError";
import { CloudinaryService } from "./cloudinaryService";

const imageRepository = AppDataSource.getRepository(Image);

export const uploadImageService = async (imageData: {
  url: string;
  public_id: string; // Añadido para guardar el public_id de Cloudinary
  alt_text?: string;
  principal: boolean;
  product: { id: string };
}) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    if (imageData.principal) {
      await queryRunner.manager.update(Image, 
        { product: { id: imageData.product.id }, principal: true },
        { principal: false }
      );
    }

    const newImage = queryRunner.manager.create(Image, imageData);
    await queryRunner.manager.save(newImage);
    await queryRunner.commitTransaction();

    return newImage;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const getProductImagesService =  async (productId: string) => {
  const images = await imageRepository.find({
    where: { product: { id: productId } },
    order: { principal: 'DESC' }
  });
  return images;
};

export const deleteImageService = async (id: string) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const image = await queryRunner.manager.findOne(Image, { 
      where: { id },
      select: ['id', 'url', 'public_id'] 
    });

    if (!image) {
      throw new AppError('Imagen no encontrada', 404);
    }

    // Eliminar de Cloudinary (si existe public_id)
    if (image.public_id) {
      await CloudinaryService.deleteImage(image.public_id);
    }
    
    // Eliminar de la base de datos
    await queryRunner.manager.delete(Image, id);
    await queryRunner.commitTransaction();

    return true;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const getImageService = async (id: string) => {
  const image = await imageRepository.findOne({
    where: { id },
    relations: ['product']
  });
  
  if (!image) {
    throw new AppError('Imagen no encontrada', 404);
  }
  return image;
};

export const updateImageService = async (id: string, updates: Partial<Image>) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const image = await queryRunner.manager.findOne(Image, {
      where: { id },
      relations: ['product']
    });

    if (!image) {
      throw new AppError('Imagen no encontrada', 404);
    }

    // Campos actualizables
    const updatableFields: Array<keyof Image> = [
      'alt_text', 'principal', 'url', 'public_id'
    ];

    updatableFields.forEach(field => {
      if (updates[field] !== undefined) {
        (image as any)[field] = updates[field];
      }
    });

    // Si se marca como principal, desmarcar las demás
    if (updates.principal === true) {
      await queryRunner.manager.update(Image, 
        { product: { id: image.product.id }, principal: true },
        { principal: false }
      );
    }

    await queryRunner.manager.save(image);
    await queryRunner.commitTransaction();

    return image;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const setMainImageService = async (imageId: string, productId: string) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Desmarcar todas las imágenes principales del producto
    await queryRunner.manager.update(Image,
      { product: { id: productId }, principal: true },
      { principal: false }
    );

    // 2. Marcar la nueva imagen como principal
    const result = await queryRunner.manager.update(Image,
      { id: imageId, product: { id: productId } },
      { principal: true }
    );

    await queryRunner.commitTransaction();
    return result.affected === 1;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};
