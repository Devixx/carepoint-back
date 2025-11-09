import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DoctorSettingsDto } from "./dto/doctor-settings.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "role",
        "specialty",
        "isActive",
        "createdAt",
        "socialMedia",
        "vacations",
      ],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "role",
        "specialty",
        "isActive",
        "createdAt",
        "updatedAt",
        "socialMedia",
        "bio",
        "address",
        "city",
        "zipCode",
        "country",
        "vacations",
      ],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async getDoctorSettings(doctorId: string) {
    const user = await this.userRepository.findOne({
      where: { id: doctorId },
    });

    if (!user) {
      throw new NotFoundException("Doctor not found");
    }

    // Extract user fields
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      specialty,
      bio,
      address,
      city,
      zipCode,
      country,
      workingHours: userWorkingHours,
      appointmentSettings: userAppointmentSettings,
      vacations,
      socialMedia,
    } = user;

    // Transform workingHours from JSON to array format
    let workingHours = [];
    if (userWorkingHours) {
      // If workingHours is already an array, use it
      if (Array.isArray(userWorkingHours)) {
        workingHours = userWorkingHours;
      } else {
        // If it's an object, convert to array
        workingHours = Object.entries(userWorkingHours).map(([day, hours]: [string, any]) => ({
          dayOfWeek: parseInt(day),
          isAvailable: hours?.isAvailable || false,
          startTime: hours?.startTime,
          endTime: hours?.endTime,
          breakStartTime: hours?.breakStartTime,
          breakEndTime: hours?.breakEndTime,
        }));
      }
    } else {
      // Default working hours (Monday to Friday, 9-17)
      workingHours = [
        { dayOfWeek: 0, isAvailable: false }, // Sunday
        { dayOfWeek: 1, isAvailable: true, startTime: "09:00", endTime: "17:00" }, // Monday
        { dayOfWeek: 2, isAvailable: true, startTime: "09:00", endTime: "17:00" }, // Tuesday
        { dayOfWeek: 3, isAvailable: true, startTime: "09:00", endTime: "17:00" }, // Wednesday
        { dayOfWeek: 4, isAvailable: true, startTime: "09:00", endTime: "17:00" }, // Thursday
        { dayOfWeek: 5, isAvailable: true, startTime: "09:00", endTime: "17:00" }, // Friday
        { dayOfWeek: 6, isAvailable: false }, // Saturday
      ];
    }

    // Default appointment settings if not set
    const appointmentSettings = userAppointmentSettings || {
      defaultDuration: 30,
      defaultFee: 80,
      consultationTypes: [
        { type: "Consultation", duration: 30, fee: 80 },
        { type: "Follow-up", duration: 15, fee: 50 },
        { type: "Routine Checkup", duration: 45, fee: 120 },
      ],
      timeSlotInterval: 15,
      advanceBookingDays: 90,
      sameDayBooking: true,
    };

    return {
      profile: {
        id,
        firstName,
        lastName,
        email,
        specialty,
        bio,
        phone,
        address,
        city,
        zipCode,
        country,
        website: socialMedia?.website,
        linkedin: socialMedia?.linkedin,
        twitter: socialMedia?.twitter,
        facebook: socialMedia?.facebook,
        instagram: socialMedia?.instagram,
      },
      workingHours,
      appointmentSettings,
      vacations: vacations || [],
    };
  }

  async updateDoctorSettings(doctorId: string, settingsDto: DoctorSettingsDto) {
    const user = await this.userRepository.findOne({
      where: { id: doctorId },
    });

    if (!user) {
      throw new NotFoundException("Doctor not found");
    }

    // Update profile fields
    if (settingsDto.profile) {
      if (settingsDto.profile.firstName !== undefined) {
        user.firstName = settingsDto.profile.firstName;
      }
      if (settingsDto.profile.lastName !== undefined) {
        user.lastName = settingsDto.profile.lastName;
      }
      if (settingsDto.profile.email !== undefined) {
        user.email = settingsDto.profile.email;
      }
      if (settingsDto.profile.specialty !== undefined) {
        user.specialty = settingsDto.profile.specialty;
      }
      if (settingsDto.profile.bio !== undefined) {
        user.bio = settingsDto.profile.bio;
      }
      if (settingsDto.profile.phone !== undefined) {
        user.phone = settingsDto.profile.phone;
      }
      if (settingsDto.profile.address !== undefined) {
        user.address = settingsDto.profile.address;
      }
      if (settingsDto.profile.city !== undefined) {
        user.city = settingsDto.profile.city;
      }
      if (settingsDto.profile.zipCode !== undefined) {
        user.zipCode = settingsDto.profile.zipCode;
      }
      if (settingsDto.profile.country !== undefined) {
        user.country = settingsDto.profile.country;
      }

      // Update social media fields
      const socialMedia = user.socialMedia || {};
      if (settingsDto.profile.website !== undefined) {
        socialMedia.website = settingsDto.profile.website;
      }
      if (settingsDto.profile.linkedin !== undefined) {
        socialMedia.linkedin = settingsDto.profile.linkedin;
      }
      if (settingsDto.profile.twitter !== undefined) {
        socialMedia.twitter = settingsDto.profile.twitter;
      }
      if (settingsDto.profile.facebook !== undefined) {
        socialMedia.facebook = settingsDto.profile.facebook;
      }
      if (settingsDto.profile.instagram !== undefined) {
        socialMedia.instagram = settingsDto.profile.instagram;
      }
      user.socialMedia = socialMedia;
    }

    // Update working hours
    if (settingsDto.workingHours !== undefined) {
      user.workingHours = settingsDto.workingHours as any;
    }

    // Update appointment settings
    if (settingsDto.appointmentSettings !== undefined) {
      user.appointmentSettings = settingsDto.appointmentSettings as any;
    }

    // Update vacations
    if (settingsDto.vacations !== undefined) {
      user.vacations = settingsDto.vacations as any;
    }

    await this.userRepository.save(user);

    // Return updated settings
    return this.getDoctorSettings(doctorId);
  }
}
