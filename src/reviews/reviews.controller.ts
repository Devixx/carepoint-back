import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReportReviewDto } from "./dto/report-review.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Public: list visible reviews for a doctor
  @Get("doctor/:doctorId")
  getDoctorReviews(@Param("doctorId") doctorId: string) {
    return this.reviewsService.getDoctorReviews(doctorId);
  }

  // Patient: submit a review after a completed appointment
  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Body() dto: CreateReviewDto, @Request() req) {
    if (req.user.type !== "patient") {
      throw new ForbiddenException("Only patients can submit reviews");
    }
    return this.reviewsService.createReview(dto, req.user.patientId);
  }

  // Doctor: see all their reviews (including hidden/reported)
  @UseGuards(JwtAuthGuard)
  @Get("mine")
  getMyReviews(@Request() req) {
    if (req.user.type !== "doctor") {
      throw new ForbiddenException("Only doctors can access this endpoint");
    }
    return this.reviewsService.getMyReviews(req.user.userId || req.user.id);
  }

  // Doctor: report a review
  @UseGuards(JwtAuthGuard)
  @Patch(":id/report")
  reportReview(
    @Param("id") id: string,
    @Body() dto: ReportReviewDto,
    @Request() req,
  ) {
    if (req.user.type !== "doctor") {
      throw new ForbiddenException("Only doctors can report reviews");
    }
    return this.reviewsService.reportReview(id, dto, req.user.userId || req.user.id);
  }
}
