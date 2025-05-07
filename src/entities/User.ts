import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Product } from "./Product";

type UserRole = 'ADMIN' | 'USER';

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ 
    length: 100,
  })
  nombre: string;

  @Column({ 
    length: 100,
  })
  apellido: string;
  
  @Column({ length: 9 })
  telefono: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'USER'],
    default: 'USER'
  })
  rol?: UserRole;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: "fecha_registro" })
  fechaRegistro: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
