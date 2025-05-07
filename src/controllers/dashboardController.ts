import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Promotion } from "../entities/Promotion";
import { sendSuccessResponse } from "../utils/functions";

const productsRepository = AppDataSource.getRepository(Product);
const usersRepository = AppDataSource.getRepository(User);
const categoriesRepository = AppDataSource.getRepository(Category);
const promotionsRepository = AppDataSource.getRepository(Promotion);

export const getDashboard: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Total de productos, usuarios y categorías
    const [totalProducts, totalUsers, totalCategories, totalPromotions] = await Promise.all([
      productsRepository.count({ where: { activo: true } }),
      usersRepository.count({ where: { activo: true } }),
      categoriesRepository.count({ where: { activa: true } }),
      promotionsRepository.count({ where: { activo: true } })
    ]);

    // Obtener el primer día y último día del mes actual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    // Productos creados en el mes actual
    const newProductsThisMonth = await productsRepository
      .createQueryBuilder("product")
      .where("product.fechaCreacion BETWEEN :startDate AND :endDate", {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      })
      .getCount();

    // Promociones activas actualmente
    const activePromotions = await promotionsRepository
      .createQueryBuilder("promotion")
      .where("promotion.activo = :activo", { activo: true })
      .andWhere("promotion.fecha_inicio <= :now", { now: new Date() })
      .andWhere("promotion.fecha_fin >= :now", { now: new Date() })
      .getCount();

    // Categoría más popular (con más productos)
    const topCategory = await categoriesRepository
      .createQueryBuilder("category")
      .leftJoin("category.products", "products")
      .select([
        "category.id",
        "category.nombre"
      ])
      .addSelect("COUNT(products.id)", "total_products")
      .where("products.activo = :activo", { activo: true })
      .groupBy("category.id")
      .orderBy("total_products", "DESC")
      .limit(1)
      .getOne();

    // Producto más caro
    const mostExpensiveProduct = await productsRepository
      .createQueryBuilder("product")
      .select([
        "product.id",
        "product.nombre",
        "product.precio"
      ])
      .where("product.activo = :activo", { activo: true })
      .orderBy("product.precio", "DESC")
      .limit(1)
      .getOne();

    // Promoción con mayor descuento
    const biggestPromotion = await promotionsRepository
      .createQueryBuilder("promotion")
      .select([
        "promotion.id",
        "promotion.nombre",
        "promotion.valor"
      ])
      .where("promotion.activo = :activo", { activo: true })
      .orderBy("promotion.valor", "DESC")
      .limit(1)
      .getOne();
   
    const dashboardData = {
      totalProducts,
      totalUsers,
      totalCategories,
      totalPromotions,
      newProductsThisMonth,
      activePromotions,
      topCategory: topCategory?.nombre || null,
      mostExpensiveProduct: mostExpensiveProduct ? {
        nombre: mostExpensiveProduct.nombre,
        precio: mostExpensiveProduct.precio
      } : null,
      biggestPromotion: biggestPromotion ? {
        nombre: biggestPromotion.nombre,
        descuento: `${biggestPromotion.valor}%`
      } : null,
    };

    sendSuccessResponse(res, dashboardData);
  } catch (error) {
    next(error);
  }
};


 