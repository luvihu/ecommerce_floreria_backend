import cloudinary from "../config/cloudinary";
import { Buffer } from "buffer";

export class CloudinaryService {
  /**
   * Sube una imagen a Cloudinary desde un buffer
   */
  static async uploadImage(buffer: Buffer, folder: string = "floreriaProducts") {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            timestamp,
            signature, // ← Añade firma
            api_key: process.env.CLOUDINARY_API_KEY, // ← Necesario para modo Signed
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });
  }

  /**
   * Elimina una imagen de Cloudinary por su public_id
   */
  static async deleteImage(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }
}
