import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ default: false })
  principal: boolean;

  @Column({ nullable: true })
  public_id: string;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: "CASCADE" })
  product: Product;
}
