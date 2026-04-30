/**
 * Supabase Storage Repository
 * Implementation of IStorageRepository using Supabase Storage
 */

import {
  IStorageRepository,
  UploadFileDTO,
} from "@/src/application/repositories/IStorageRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

export class SupabaseStorageRepository implements IStorageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Compress image buffer to JPEG, resize to max 2048px, keep under 2MB
   */
  private async compressImage(buffer: Buffer): Promise<Buffer> {
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    let compressed = Buffer.from(
      await sharp(buffer)
        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer(),
    );

    if (compressed.length > MAX_SIZE_BYTES) {
      console.warn(
        `[compressImage] Still ${compressed.length} bytes, lowering quality...`,
      );

      for (let quality = 80; quality >= 60; quality -= 10) {
        compressed = Buffer.from(
          await sharp(buffer)
            .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality })
            .toBuffer(),
        );
        if (compressed.length <= MAX_SIZE_BYTES) break;
      }
    }

    return compressed;
  }

  /**
   * Upload a file to storage
   */
  async upload(data: UploadFileDTO): Promise<string> {
    const { buffer, fileName, contentType, bucket, folder = "" } = data;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return this.getPublicUrl(uploadData.path, bucket);
  }

  /**
   * Upload a base64 encoded file
   */
  async uploadBase64(
    base64Data: string,
    fileName: string,
    bucket: string,
    folder = "generated",
  ): Promise<string> {
    const rawBuffer = Buffer.from(base64Data, "base64");
    const compressedBuffer = await this.compressImage(rawBuffer);

    const filePath = `${folder}/${Date.now()}-${fileName}.jpeg`;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return this.getPublicUrl(uploadData.path, bucket);
  }

  /**
   * Fetch an image from a URL and upload it to storage
   */
  async uploadFromUrl(
    imageUrl: string,
    fileName: string,
    bucket: string,
    folder = "generated",
  ): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from URL: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    const compressedBuffer = await this.compressImage(rawBuffer);

    const filePath = `${folder}/${Date.now()}-${fileName}.jpeg`;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return this.getPublicUrl(uploadData.path, bucket);
  }

  /**
   * Get public URL of a file
   */
  getPublicUrl(path: string, bucket: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Delete a file from storage
   */
  async delete(path: string, bucket: string): Promise<boolean> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Storage delete error:", error);
      return false;
    }

    return true;
  }
}
