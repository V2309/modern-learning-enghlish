import ImageKit from "imagekit";

// Global singleton instance for ImageKit
let imagekitInstance: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (!imagekitInstance) {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error(
        "ImageKit configuration is missing. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in your environment variables."
      );
    }

    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imagekitInstance;
}

export interface UploadOptions {
  file: Buffer | string;
  fileName: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
}

/**
 * Upload a file (Buffer, base64 string, or remote URL) to ImageKit
 */
export async function uploadFileToImageKit({
  file,
  fileName,
  folder = "/uploads",
  tags = [],
  useUniqueFileName = true,
}: UploadOptions) {
  const client = getImageKitClient();

  const response = await client.upload({
    file,
    fileName,
    folder,
    tags,
    useUniqueFileName,
  });

  return response;
}

/**
 * Delete a file from ImageKit by fileId
 */
export async function deleteFileFromImageKit(fileId: string) {
  const client = getImageKitClient();
  return await client.deleteFile(fileId);
}

export default getImageKitClient;
