import { Router } from "express";
import { uploadImage, getIdImage, updateImage, setMainImage, deleteImage, getProductImages } from "../controllers/imageController";
import { processImage } from "../middlewares/imageProcessor";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";

const routerImage = Router();

routerImage.post('/products/:productId/images', authMiddleware, isAdmin, processImage, uploadImage); // Sube una nueva imagen
routerImage.get('/:id', getIdImage); //obtener una imagen por ID
routerImage.get('/products/:productId/images', authMiddleware, isAdmin, getProductImages);  //obtener todas las imagenes de un producto
routerImage.put('/:id', authMiddleware, isAdmin, processImage, updateImage);  // Actualiza metadatos de imagen
routerImage.patch('/products/:productId/images/:id/main', authMiddleware, isAdmin, setMainImage); // Establece como imagen principal
routerImage.delete('/:id', authMiddleware, isAdmin, deleteImage);

export default routerImage;
