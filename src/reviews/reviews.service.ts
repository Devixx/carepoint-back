import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "./entities/review.entity";
import { User } from "../users/entities/user.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReportReviewDto } from "./dto/report-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async createReview(dto: CreateReviewDto, patientId: string): Promise<Review> {
    // Verify the appointment belongs to this patient and is completed
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointmentId },
      relations: ["patient", "doctor"],
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }
    if (appointment.patient?.id !== patientId) {
      throw new ForbiddenException("This appointment does not belong to you");
    }
    if (appointment.status !== "completed") {
      throw new BadRequestException("You can only review completed appointments");
    }
    if (appointment.doctor?.id !== dto.doctorId) {
      throw new BadRequestException("Doctor does not match the appointment");
    }

    // Prevent duplicate reviews for the same appointment
    const existing = await this.reviewRepository.findOne({
      where: { appointmentId: dto.appointmentId, patientId },
    });
    if (existing) {
      throw new BadRequestException("You have already reviewed this appointment");
    }

    const review = this.reviewRepository.create({
      ...dto,
      patientId,
    });
    const saved = await this.reviewRepository.save(review);

    await this.recalculateDoctorRating(dto.doctorId);
    return saved;
  }

  async getDoctorReviews(doctorId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { doctorId, isHidden: false },
      relations: ["patient"],
      order: { createdAt: "DESC" },
    });
  }

  async getMyReviews(doctorId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { doctorId },
      relations: ["patient", "appointment"],
      order: { createdAt: "DESC" },
    });
  }

  async reportReview(reviewId: string, dto: ReportReviewDto, doctorId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException("Review not found");
    if (review.doctorId !== doctorId) throw new ForbiddenException("Not your review");

    review.reportReason = dto.reason;
    review.reportedAt = new Date();
    return this.reviewRepository.save(review);
  }

  private async recalculateDoctorRating(doctorId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { doctorId, isHidden: false },
      select: ["rating"],
    });

    if (reviews.length === 0) return;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.userRepository.update(doctorId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });
  }
}
