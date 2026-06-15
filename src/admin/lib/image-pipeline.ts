import sharp from "sharp";

export interface ProcessedImage {
  originalName: string;
  mimeType: string;
  webpBuffer: Buffer;
  thumbnailBuffer: Buffer;
  sizeBytes: number;
  width: number;
  height: number;
}

export async function processImageUpload(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<ProcessedImage> {
  const image = sharp(fileBuffer);

  // EXIF metadata removal is handled by default unless withMetadata is called.
  // rotate() auto-rotates based on EXIF orientation tag before dropping it.
  const baseImage = image.rotate(); 

  // Create main webp (max 1920px width)
  const webpBuffer = await baseImage
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const finalMetadata = await sharp(webpBuffer).metadata();

  // Create thumbnail webp (max 400px width)
  const thumbnailBuffer = await baseImage
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  return {
    originalName,
    mimeType: "image/webp",
    webpBuffer,
    thumbnailBuffer,
    sizeBytes: webpBuffer.length,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  };
}

const MAGIC_NUMBERS = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
};

export function validateMagicNumber(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  
  const check = (magic: number[]) => magic.every((b, i) => buffer[i] === b);
  
  if (check(MAGIC_NUMBERS.jpeg)) return true;
  if (check(MAGIC_NUMBERS.png)) return true;
  if (check(MAGIC_NUMBERS.gif)) return true;
  
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.length > 11 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return true;
    }
  }

  // HEIC (ftypheic or ftypmif1 or ftypheix)
  if (buffer.length > 7 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return true; // Weak check for HEIC/ISO media, sharp will fail if it's invalid anyway
  }

  return false;
}
