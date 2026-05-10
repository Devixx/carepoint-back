import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
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
        "bio",
        "isActive",
        "acceptsCNS",
        "acceptsVideo",
        "rating",
        "reviewCount",
        "languages",
        "workingHoursDisplay",
        "createdAt",
        "socialMedia",
        "vacations",
        "address",
        "city",
        "country",
        "latitude",
        "longitude",
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
        "bio",
        "isActive",
        "acceptsCNS",
        "acceptsVideo",
        "rating",
        "reviewCount",
        "languages",
        "workingHoursDisplay",
        "createdAt",
        "updatedAt",
        "socialMedia",
        "address",
        "city",
        "zipCode",
        "country",
        "latitude",
        "longitude",
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

  /**
   * Haversine formula to calculate distance between two GPS coordinates in km
   */
  private haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find doctors near a given location, sorted by distance
   */
  async findDoctorsNearby(
    lat: number,
    lng: number,
    radiusKm: number = 50,
    filters?: { specialty?: string; search?: string },
  ) {
    let doctors = await this.findAll();
    doctors = doctors.filter((d) => d.role === UserRole.DOCTOR);

    if (filters?.specialty) {
      doctors = doctors.filter((d) =>
        d.specialty?.toLowerCase().includes(filters.specialty!.toLowerCase()),
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.firstName.toLowerCase().includes(q) ||
          d.lastName.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q),
      );
    }

    // Calculate distance and filter by radius
    const doctorsWithDistance = doctors
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => {
        const distance = this.haversineDistance(lat, lng, d.latitude!, d.longitude!);
        return { ...d, distance: Math.round(distance * 10) / 10 };
      })
      .filter((d) => d.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    // Also include doctors without coordinates at the end
    const doctorsWithoutLocation = doctors
      .filter((d) => d.latitude == null || d.longitude == null)
      .map((d) => ({ ...d, distance: null }));

    return [...doctorsWithDistance, ...doctorsWithoutLocation];
  }
  /**
   * Find doctors in a specific city, with distance from city center
   */
  async findDoctorsByCity(
    city: string,
    filters?: { specialty?: string; search?: string },
  ) {
    let doctors = await this.findAll();
    doctors = doctors.filter((d) => d.role === UserRole.DOCTOR);

    if (filters?.specialty) {
      doctors = doctors.filter((d) =>
        d.specialty?.toLowerCase().includes(filters.specialty!.toLowerCase()),
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.firstName.toLowerCase().includes(q) ||
          d.lastName.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q),
      );
    }

    // Strictly filter to only doctors in the selected city
    const cityLower = city.toLowerCase();
    const cityDoctors = doctors.filter((d) =>
      d.city?.toLowerCase().includes(cityLower),
    );

    // Known city centers for distance calculation
    const cityCenters: Record<string, { lat: number; lng: number }> = {
      'luxembourg city': { lat: 49.6116, lng: 6.1319 },
      'esch-sur-alzette': { lat: 49.4958, lng: 5.9806 },
      'differdange': { lat: 49.5244, lng: 5.8910 },
      'ettelbruck': { lat: 49.8472, lng: 6.1042 },
      'strassen': { lat: 49.6205, lng: 6.0749 },
      'kirchberg': { lat: 49.6319, lng: 6.1750 },
      'dudelange': { lat: 49.4803, lng: 6.0874 },
      'pétange': { lat: 49.5581, lng: 5.8819 },
    };

    const center = cityCenters[cityLower];

    // Add distance from city center if coordinates are available
    if (center) {
      return cityDoctors.map((d) => {
        if (d.latitude != null && d.longitude != null) {
          const distance = this.haversineDistance(center.lat, center.lng, d.latitude, d.longitude);
          return { ...d, distance: Math.round(distance * 10) / 10 };
        }
        return { ...d, distance: null };
      }).sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return (a.distance as number) - (b.distance as number);
      });
    }

    return cityDoctors;
  }
}
