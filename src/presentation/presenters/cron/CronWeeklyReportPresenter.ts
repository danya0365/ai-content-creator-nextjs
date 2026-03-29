import { IContentRepository } from '@/src/application/repositories/IContentRepository';
import { IWeeklyReportRepository, CreateWeeklyReportDTO } from '@/src/application/repositories/IWeeklyReportRepository';

export interface WeeklyReportResponse {
  success: boolean;
  message: string;
  reportId?: string;
  report?: any;
  error?: string;
}

export class CronWeeklyReportPresenter {
  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly reportRepository: IWeeklyReportRepository
  ) {}

  /**
   * Handle the weekly report generation request
   */
  async handleGenerateReportRequest(isAuthorized: boolean): Promise<WeeklyReportResponse> {
    if (!isAuthorized) {
      return { success: false, message: 'Unauthorized access', error: 'Unauthorized' };
    }

    try {
      // 1. Calculate date range (last 7 days)
      const now = new Date();
      const endDate = new Date(now);
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);

      const periodStart = startDate.toISOString().split('T')[0];
      const periodEnd = endDate.toISOString().split('T')[0];

      console.log(`[Weekly Report] 📊 Generating report for ${periodStart} to ${periodEnd}`);

      // 2. Get report data from repository (Calculated at Repository/DB level)
      const reportData = await this.contentRepository.getReportData(
        startDate.toISOString(),
        endDate.toISOString()
      );

      // 3. Build DTO for saving
      const createDto: CreateWeeklyReportDTO = {
        periodStart,
        periodEnd,
        totalGenerated: reportData.totalGenerated,
        totalPublished: reportData.totalPublished,
        totalFailed: reportData.totalFailed,
        totalDrafts: reportData.totalDrafts,
        totalLikes: reportData.totalLikes,
        totalShares: reportData.totalShares,
        avgLikesPerContent: reportData.totalPublished > 0 ? Math.round(reportData.totalLikes / reportData.totalPublished) : 0,
        avgSharesPerContent: reportData.totalPublished > 0 ? Math.round(reportData.totalShares / reportData.totalPublished) : 0,
        topPerformingContent: reportData.topPerformingContent,
        contentMorning: reportData.contentByTimeSlot.morning,
        contentLunch: reportData.contentByTimeSlot.lunch,
        contentAfternoon: reportData.contentByTimeSlot.afternoon,
        contentEvening: reportData.contentByTimeSlot.evening,
        contentByType: reportData.contentByType,
      };

      const savedReport = await this.reportRepository.upsert(createDto);

      return {
        success: true,
        message: 'Weekly report generated and saved successfully',
        reportId: savedReport.id,
        report: createDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Weekly Report] ❌ Error:', errorMessage);
      return { success: false, message: 'Failed to generate report', error: errorMessage };
    }
  }
}
