/**
 * Cron Job API Route for Publishing Scheduled Content
 * POST /api/cron/publish
 * 
 * This endpoint should be called every 5 minutes to publish content
 * that has reached its scheduled time.
 * 
 * ✅ Uses SupabaseContentRepository for single source of truth
 */

import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (security check)
    const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;

    // Allow localhost or valid secret
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    if (!isLocalhost && expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Use admin client (single source of truth)
    const supabase = createAdminClient();
    const contentRepo = new SupabaseContentRepository(supabase);

    // Get current time
    const now = new Date();
    console.log(`[Cron Publish] 🕐 Running at ${now.toISOString()}`);

    // Get all scheduled contents
    const allContents = await contentRepo.getAll({ status: 'scheduled' });
    
    // Filter contents that should be published (scheduledAt <= now)
    const contentsToPublish = allContents.filter(content => {
      if (!content.scheduledAt) return false;
      const scheduledTime = new Date(content.scheduledAt);
      return scheduledTime <= now;
    });

    if (contentsToPublish.length === 0) {
      console.log('[Cron Publish] ✅ No content to publish at this time');
      return NextResponse.json({
        success: true,
        message: 'No content to publish at this time',
        published: 0,
      });
    }

    console.log(`[Cron Publish] 📤 Found ${contentsToPublish.length} content(s) to publish`);

    // Publish each content
    const publishResults = await Promise.allSettled(
      contentsToPublish.map(async (content) => {
        try {
          // Update status to published
          const updatedContent = await contentRepo.update(content.id, {
            status: 'published',
            publishedAt: now.toISOString(),
          });

          console.log(`[Cron Publish] ✅ Published: ${content.id} - ${content.title}`);

          // TODO: Add your social media publishing logic here
          // e.g., Post to Facebook, Twitter, Instagram, etc.
          // await publishToFacebook(content);
          // await publishToTwitter(content);

          return {
            id: content.id,
            title: content.title,
            status: 'published',
          };
        } catch (error) {
          console.error(`[Cron Publish] ❌ Failed to publish ${content.id}:`, error);
          
          // Mark as failed
          await contentRepo.update(content.id, {
            status: 'failed',
          });

          throw error;
        }
      })
    );

    // Count results
    const successCount = publishResults.filter(r => r.status === 'fulfilled').length;
    const failedCount = publishResults.filter(r => r.status === 'rejected').length;

    console.log(`[Cron Publish] 📊 Results: ${successCount} published, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Published ${successCount} content(s)`,
      published: successCount,
      failed: failedCount,
      details: publishResults.map((result, index) => ({
        contentId: contentsToPublish[index].id,
        title: contentsToPublish[index].title,
        status: result.status === 'fulfilled' ? 'published' : 'failed',
        error: result.status === 'rejected' ? (result.reason as Error).message : undefined,
      })),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cron Publish] ❌ Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Also allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
