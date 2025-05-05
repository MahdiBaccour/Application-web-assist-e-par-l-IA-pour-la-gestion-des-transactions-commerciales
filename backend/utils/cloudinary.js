import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (imageData, userId) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: "projet-pfe/user-avatar",
      public_id: `user-${userId}`,
      overwrite: true,
      allowed_formats: ["jpg", "jpeg", "png"],
      quality: "auto:good",
      width: 400
    });
    console.log("Image uploaded to Cloudinary:", uploadResult);
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Erreur de téléchargement Cloudinary:", error);
    throw new Error("Échec du téléchargement de l'image");
  }
};