import { SupabaseStorageRepository } from "@/src/infrastructure/repositories/SupabaseStorageRepository";
import { createAdminClient } from "@/src/infrastructure/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const AI_CONTENTS_BUCKET = "ai-contents";

/**
 * POST /api/ai/upload-image
 * Fetches an image from a remote URL and uploads it to Supabase Storage.
 * Accepts: { imageUrl: string }
 * Returns: { success: true, imageUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body as { imageUrl?: string };

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required field: imageUrl" },
        { status: 400 },
      );
    }

    // 1. Fetch the image from the remote URL
    console.log(`[upload-image] Fetching image from: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`,
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType =
      imageResponse.headers.get("content-type") || "image/png";

    console.log(
      `[upload-image] Fetched ${buffer.length} bytes, contentType: ${contentType}`,
    );

    if (!contentType.startsWith("image/")) {
      throw new Error(
        `Fetched content is not an image. Content-Type: ${contentType}`,
      );
    }

    // 2. Always compress to JPEG for reliable Supabase upload
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB threshold
    console.log(`[upload-image] Compressing ${buffer.length} bytes to JPEG...`);

    const finalBuffer = Buffer.from(
      await sharp(buffer)
        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer(),
    );

    const finalContentType = "image/jpeg";
    const finalExtension = "jpeg";

    if (finalBuffer.length > MAX_SIZE_BYTES) {
      console.warn(
        `[upload-image] Compressed image still exceeds 2MB (${finalBuffer.length} bytes), may fail upload`,
      );
    }

    console.log(`[upload-image] Compressed to ${finalBuffer.length} bytes`);

    // 3. Upload to Supabase Storage
    console.log(
      `[upload-image] SUPABASE_SERVICE_ROLE_KEY set: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    );
    console.log(
      `[upload-image] NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`,
    );

    const supabase = createAdminClient();
    const storageRepository = new SupabaseStorageRepository(supabase);

    // Verify bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();
    if (listError) {
      console.error("[upload-image] Failed to list buckets:", listError);
      throw new Error(`Supabase connection failed: ${listError.message}`);
    }
    const bucketExists = buckets?.some((b) => b.name === AI_CONTENTS_BUCKET);
    console.log(
      `[upload-image] Buckets found: ${buckets?.map((b) => b.name).join(", ")}. Target bucket '${AI_CONTENTS_BUCKET}' exists: ${bucketExists}`,
    );
    if (!bucketExists) {
      throw new Error(
        `Supabase bucket '${AI_CONTENTS_BUCKET}' not found. Available: ${buckets?.map((b) => b.name).join(", ") || "none"}`,
      );
    }

    const fileName = `photo-${Date.now()}.${finalExtension}`;
    console.log(
      `[upload-image] Uploading to ${AI_CONTENTS_BUCKET}/generated/${fileName}`,
    );

    try {
      const publicUrl = await storageRepository.upload({
        buffer: finalBuffer,
        fileName,
        contentType: finalContentType,
        bucket: AI_CONTENTS_BUCKET,
        folder: "generated",
      });
      console.log(`[upload-image] Uploaded to Supabase: ${publicUrl}`);

      return NextResponse.json({
        success: true,
        imageUrl: publicUrl,
      });
    } catch (uploadErr) {
      console.error(
        "[upload-image] Supabase upload error:",
        uploadErr instanceof Error ? uploadErr.message : uploadErr,
      );
      throw uploadErr;
    }
  } catch (error) {
    console.error("[API upload-image] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
