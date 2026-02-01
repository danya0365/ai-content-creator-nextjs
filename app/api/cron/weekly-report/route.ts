/**
 * Cron Job API Route for Weekly Report
 * POST /api/cron/weekly-report
 * 
 * Generates weekly analytics report every Monday at 9:00 AM
 * Saves report to database for dashboard display
 * 
 * ✅ Uses SupabaseContentRepository for single source of truth
 * ✅ Uses SupabaseWeeklyReportRepository for saving reports
 */

import { CreateWeeklyReportDTO } from '@/src/application/repositories/IWeeklyReportRepository';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { SupabaseWeeklyReportRepository } from '@/src/infrastructure/repositories/SupabaseWeeklyReportRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface WeeklyReportData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalGenerated: number;
    totalPublished: number;
    totalFailed: number;
    totalDrafts: number;
  };
  engagement: {
    totalLikes: number;
    totalShares: number;
    averageLikesPerContent: number;
    averageSharesPerContent: number;
  };
  topPerformingContent: {
    id: string;
    title: string;
    likes: number;
    shares: number;
  }[];
  contentByTimeSlot: {
    morning: number;
    lunch: number;
    afternoon: number;
    evening: number;
  };
  contentByType: Record<string, number>;
}

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
    const reportRepo = new SupabaseWeeklyReportRepository(supabase);

    // Calculate date range (last 7 days)
    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);

    const periodStart = startDate.toISOString().split('T')[0];
    const periodEnd = endDate.toISOString().split('T')[0];

    console.log(`[Weekly Report] 📊 Generating report for ${periodStart} to ${periodEnd}`);

    // Get all contents
    const allContents = await contentRepo.getAll();

    // Filter contents from last week
    const weeklyContents = allContents.filter(content => {
      const createdAt = new Date(content.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });

    // Calculate statistics
    const publishedContents = weeklyContents.filter(c => c.status === 'published');
    
    const totalLikes = publishedContents.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalShares = publishedContents.reduce((sum, c) => sum + (c.shares || 0), 0);

    // Top performing content (by likes + shares)
    const topPerformingContent = [...publishedContents]
      .sort((a, b) => ((b.likes || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.shares || 0)))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        likes: c.likes || 0,
        shares: c.shares || 0,
      }));

    // Content by time slot
    const contentByTimeSlot = {
      morning: weeklyContents.filter(c => c.timeSlot === 'morning').length,
      lunch: weeklyContents.filter(c => c.timeSlot === 'lunch').length,
      afternoon: weeklyContents.filter(c => c.timeSlot === 'afternoon').length,
      evening: weeklyContents.filter(c => c.timeSlot === 'evening').length,
    };

    // Content by type
    const contentByType: Record<string, number> = {};
    weeklyContents.forEach(c => {
      contentByType[c.contentTypeId] = (contentByType[c.contentTypeId] || 0) + 1;
    });

    // Build report data
    const reportData: WeeklyReportData = {
      period: {
        start: periodStart,
        end: periodEnd,
      },
      summary: {
        totalGenerated: weeklyContents.length,
        totalPublished: publishedContents.length,
        totalFailed: weeklyContents.filter(c => c.status === 'failed').length,
        totalDrafts: weeklyContents.filter(c => c.status === 'draft').length,
      },
      engagement: {
        totalLikes,
        totalShares,
        averageLikesPerContent: publishedContents.length > 0 
          ? Math.round(totalLikes / publishedContents.length) 
          : 0,
        averageSharesPerContent: publishedContents.length > 0 
          ? Math.round(totalShares / publishedContents.length) 
          : 0,
      },
      topPerformingContent,
      contentByTimeSlot,
      contentByType,
    };

    // ✅ Save report to database
    const createDto: CreateWeeklyReportDTO = {
      periodStart,
      periodEnd,
      totalGenerated: reportData.summary.totalGenerated,
      totalPublished: reportData.summary.totalPublished,
      totalFailed: reportData.summary.totalFailed,
      totalDrafts: reportData.summary.totalDrafts,
      totalLikes: reportData.engagement.totalLikes,
      totalShares: reportData.engagement.totalShares,
      avgLikesPerContent: reportData.engagement.averageLikesPerContent,
      avgSharesPerContent: reportData.engagement.averageSharesPerContent,
      topPerformingContent: reportData.topPerformingContent,
      contentMorning: reportData.contentByTimeSlot.morning,
      contentLunch: reportData.contentByTimeSlot.lunch,
      contentAfternoon: reportData.contentByTimeSlot.afternoon,
      contentEvening: reportData.contentByTimeSlot.evening,
      contentByType: reportData.contentByType,
    };

    const savedReport = await reportRepo.upsert(createDto);

    console.log('[Weekly Report] ✅ Report saved to database, ID:', savedReport.id);
    console.log(`[Weekly Report] 📈 Total: ${reportData.summary.totalGenerated} generated, ${reportData.summary.totalPublished} published`);
    console.log(`[Weekly Report] ❤️ Engagement: ${reportData.engagement.totalLikes} likes, ${reportData.engagement.totalShares} shares`);

    // TODO: Add your notification logic here
    // e.g., Send email, Slack notification, etc.
    // await sendEmailReport(reportData);
    // await sendSlackNotification(reportData);

    return NextResponse.json({
      success: true,
      message: 'Weekly report generated and saved successfully',
      reportId: savedReport.id,
      report: reportData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Weekly Report] ❌ Error:', errorMessage);
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
