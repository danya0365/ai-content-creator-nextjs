/**
 * Supabase Storage Repository
 * Implementation of IStorageRepository using Supabase Storage
 */

import {
    IStorageRepository,
    UploadFileDTO,
} from '@/src/application/repositories/IStorageRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorageRepository implements IStorageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Upload a file to storage
   */
  async upload(data: UploadFileDTO): Promise<string> {
    const { buffer, fileName, contentType, bucket, folder = '' } = data;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
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
    folder = 'generated'
  ): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = `${folder}/${Date.now()}-${fileName}.png`;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
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
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  }
}
