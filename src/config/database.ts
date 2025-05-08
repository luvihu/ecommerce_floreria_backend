import { DataSource } from "typeorm";
import "dotenv/config";
import path from "path";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { Promotion } from "../entities/Promotion";
import { Image } from "../entities/Image";


export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, 
  ssl: true, // Conexión segura
  synchronize: true,
  logging: false,
  entities: [User, Product, Category, Promotion, Image],
  extra: {
    ssl: {
      rejectUnauthorized: false, // Necesario para evitar errores de certificado
    },
  },
});
