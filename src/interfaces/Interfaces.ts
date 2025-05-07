type UserRole = 'ADMIN' | 'USER';

export interface IUser {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  password: string;
  rol?: UserRole;
  activo: boolean;
  fechaRegistro: Date;  
  products?: IProduct[];
};

export interface ICategory {
  id: string;
  nombre: string;
  activa?: boolean;
  products: IProduct[];
};

export interface IProduct {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  activo?: boolean;
  fechaCreacion: Date;
  user?: IUser;
  categories: ICategory[];
  images: IImage[];
  promotions: IPromotion[];
};

export interface IImage {
  id: string;
  url: string;
  alt_text?: string;
  principal: boolean;
  public_id?: string;
  product: IProduct;
};


export interface IPromotion {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  valor: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  activa: boolean;
  products: IProduct[]; 
}