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
  host: process.env.POSTGRES_HOST || "localhost", 
  port: Number(process.env.POSTGRES_PORT) || 6543,
  username: process.env.POSTGRES_USER, 
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || "postgres",
  ssl: { rejectUnauthorized: false }, // Obligatorio
  entities: [User, Product, Category, Promotion, Image],
  synchronize: false,
  extra: {
    connectionTimeoutMillis: 10000,
    max: 5, // Límite de conexiones
  },
});
