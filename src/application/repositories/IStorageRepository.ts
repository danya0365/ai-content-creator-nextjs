/**
 * Storage Repository Interface
 * Defines the contract for file storage operations
 */

export interface UploadFileDTO {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  bucket: string;
  folder?: string;
}

export interface IStorageRepository {
  /**
   * Upload a file to storage
   * @returns Public URL of the uploaded file
   */
  upload(data: UploadFileDTO): Promise<string>;

  /**
   * Upload a base64 encoded file
   * @returns Public URL of the uploaded file
   */
  uploadBase64(
    base64Data: string,
    fileName: string,
    bucket: string,
    folder?: string
  ): Promise<string>;

  /**
   * Get public URL of a file
   */
  getPublicUrl(path: string, bucket: string): string;

  /**
   * Delete a file from storage
   */
  delete(path: string, bucket: string): Promise<boolean>;
}
