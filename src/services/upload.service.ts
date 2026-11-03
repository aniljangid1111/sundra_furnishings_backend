import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { UploadApiResponse } from "cloudinary";

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// Upload buffer directly to Cloudinary folder (sundara)
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folderName: string = env.CLOUDINARY_FOLDER
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Extract Cloudinary publicId from full asset URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match && match[1] ? match[1] : null;
};

// Delete existing asset from Cloudinary when replacing
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary asset deletion failed:", error);
    return false;
  }
};
