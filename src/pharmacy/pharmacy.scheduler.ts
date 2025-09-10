import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PharmacyService } from "./pharmacy.service";

@Injectable()
export class PharmacyScheduler {
  private readonly logger = new Logger(PharmacyScheduler.name);

  constructor(private readonly pharmacyService: PharmacyService) {}

  // Refresh pharmacy data every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshPharmacyData() {
    this.logger.log("Scheduled pharmacy data refresh started");

    try {
      await this.pharmacyService.refreshPharmacyData();
      this.logger.log("Scheduled pharmacy data refresh completed");
    } catch (error) {
      this.logger.error(
        "Scheduled pharmacy data refresh failed:",
        error.message,
      );
    }
  }

  // Refresh at 6 AM every day (when new duty lists are published)
  @Cron("0 6 * * *", {
    timeZone: "Europe/Luxembourg",
  })
  async dailyPharmacyRefresh() {
    this.logger.log("Daily pharmacy data refresh started");

    try {
      await this.pharmacyService.refreshPharmacyData();
      this.logger.log("Daily pharmacy data refresh completed");
    } catch (error) {
      this.logger.error("Daily pharmacy data refresh failed:", error.message);
    }
  }
}
