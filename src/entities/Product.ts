import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable, 
  OneToMany 
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Image } from "./Image";
import { Promotion } from "./Promotion";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  nombre: string;

  @Column({ type: "text", nullable: true })
  descripcion: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  precio: number;
 
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @ManyToOne(() => User, (user) => user.products, { nullable: true })
  user?: User;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: "product_categories",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
  })
  categories: Category[];

  @OneToMany(() => Image, (image) => image.product)
  images: Image[];

  @ManyToMany(() => Promotion, (promotion) => promotion.products)
  @JoinTable({
    name: "product_promotions",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "promotion_id", referencedColumnName: "id" }
  })
  promotions: Promotion[];
}
