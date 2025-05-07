import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Product } from "./Product";

@Entity("promotions")
export class Promotion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nombre: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ type: "enum", enum: ["porcentaje"], default: "porcentaje" })
  tipo: "porcentaje";

  @Column({ type: "decimal", precision: 5, scale: 2})
  valor: number;

  @Column({ type: "timestamp" })
  fecha_inicio: Date;

  @Column({ type: "timestamp" })
  fecha_fin: Date;

  @Column({ default: true })
  activo: boolean;

  @ManyToMany(() => Product, (product) => product.promotions)
  products: Product[];
}
