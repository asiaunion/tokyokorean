import { put, del, list } from "@vercel/blob";

export interface StorageFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export interface StorageProvider {
  upload(file: Buffer, filename: string, mime: string): Promise<string>;
  delete(url: string): Promise<void>;
  list(prefix?: string): Promise<StorageFile[]>;
}

export class VercelBlobProvider implements StorageProvider {
  async upload(file: Buffer, filename: string, mime: string): Promise<string> {
    const { url } = await put(filename, file, {
      access: "public",
      contentType: mime,
    });
    return url;
  }

  async delete(url: string): Promise<void> {
    await del(url);
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const { blobs } = await list({ prefix });
    return blobs.map(b => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
  }
}

export const storage = new VercelBlobProvider();
