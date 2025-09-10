import { Controller, Get, Post, UseGuards, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PharmacyService } from "./pharmacy.service";

@Controller("pharmacy")
@UseGuards(JwtAuthGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get("duty-today")
  async getTodayDutyPharmacies() {
    return this.pharmacyService.getTodayDutyPharmacies();
  }

  @Post("refresh")
  async refreshPharmacyData() {
    return this.pharmacyService.refreshPharmacyData();
  }

  @Get("cache-status")
  async getCacheStatus() {
    return this.pharmacyService.getCacheStatus();
  }

  @Get("search")
  async searchPharmacies(@Query("city") city: string) {
    if (!city) {
      return { error: "City parameter required" };
    }

    const pharmacies = this.pharmacyService.searchPharmaciesByCity(city);
    return { city, pharmacies };
  }
}
