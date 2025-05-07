import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Product } from "./Product";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nombre: string;
 
  @Column({ default: true })
  activa: boolean;

  @ManyToMany(() => Product, (product) => product.categories, { onDelete: 'CASCADE' })
  products: Product[];
}
