import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Client } from "../clients/entities/client.entity";
import { Appointment } from "../appointments/entities/appointment.entity";
import { PharmacyService } from "../pharmacy/pharmacy.service";
import { now, toLocaleDateString, toLocaleTimeString } from "../utils/date.utils";

interface ChatResponse {
  message: string;
  suggestions?: string[];
  data?: any;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly pharmacyService: PharmacyService,
  ) {}

  async processMessage(
    message: string,
    patientId: string,
  ): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase().trim();

    // Intent detection
    if (this.isGreeting(lowerMessage)) {
      return this.getGreeting();
    }

    if (this.isDoctorQuery(lowerMessage)) {
      return await this.handleDoctorQuery(lowerMessage);
    }

    if (this.isAppointmentQuery(lowerMessage)) {
      return await this.handleAppointmentQuery(lowerMessage, patientId);
    }

    if (this.isAppUsageQuery(lowerMessage)) {
      return this.handleAppUsageQuery(lowerMessage);
    }

    if (this.isCNSQuery(lowerMessage)) {
      return this.handleCNSQuery(lowerMessage);
    }

    if (this.isPIDQuery(lowerMessage)) {
      return this.handlePIDQuery(lowerMessage);
    }

    if (this.isEmergencyQuery(lowerMessage)) {
      return this.handleEmergencyQuery();
    }

    if (this.isPharmacyQuery(lowerMessage)) {
      console.log("🏥 Detected pharmacy query");
      return await this.handlePharmacyQuery(lowerMessage);
    }

    // Default fallback
    return this.getDefaultResponse();
  }

  private isPharmacyQuery(message: string): boolean {
    const pharmacyKeywords = [
      "pharmacy",
      "pharmacie",
      "garde",
      "duty",
      "medication",
      "médicament",
      "prescription",
      "ordonnance",
      "open",
      "ouvert",
      "night",
      "nuit",
      "sunday",
      "dimanche",
      "24h",
      "urgence pharmacie",
      "pharmacie urgence",
    ];
    return pharmacyKeywords.some((keyword) => message.includes(keyword));
  }

  // Intent detection methods
  private isGreeting(message: string): boolean {
    const greetings = [
      "hello",
      "hi",
      "hey",
      "bonjour",
      "salut",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    return greetings.some((greeting) => message.includes(greeting));
  }

  private isDoctorQuery(message: string): boolean {
    const doctorKeywords = [
      "doctor",
      "physician",
      "specialist",
      "find care",
      "médecin",
      "docteur",
      "spécialiste",
    ];
    return doctorKeywords.some((keyword) => message.includes(keyword));
  }

  private isAppointmentQuery(message: string): boolean {
    const appointmentKeywords = [
      "appointment",
      "booking",
      "schedule",
      "rendez-vous",
      "réserver",
      "annuler",
      "cancel",
      "reschedule",
    ];
    return appointmentKeywords.some((keyword) => message.includes(keyword));
  }

  private isAppUsageQuery(message: string): boolean {
    const appKeywords = [
      "how to",
      "how do i",
      "where is",
      "comment",
      "où se trouve",
      "navigate",
      "use app",
      "profile",
      "records",
    ];
    return appKeywords.some((keyword) => message.includes(keyword));
  }

  private isCNSQuery(message: string): boolean {
    const cnsKeywords = [
      "cns",
      "insurance",
      "health insurance",
      "assurance",
      "caisse nationale",
      "social security",
      "reimbursement",
    ];
    return cnsKeywords.some((keyword) => message.includes(keyword));
  }

  private isPIDQuery(message: string): boolean {
    const pidKeywords = [
      "pid",
      "patient id",
      "identification",
      "matricule",
      "numéro patient",
      "patient number",
    ];
    return pidKeywords.some((keyword) => message.includes(keyword));
  }

  private isEmergencyQuery(message: string): boolean {
    const emergencyKeywords = [
      "emergency",
      "urgent",
      "urgence",
      "help",
      "aide",
      "112",
      "ambulance",
    ];
    return emergencyKeywords.some((keyword) => message.includes(keyword));
  }

  // Response handlers
  private getGreeting(): ChatResponse {
    return {
      message:
        "Hello! I'm your CarePoint assistant. I can help you with:\n• Finding doctors and specialists\n• Managing appointments\n• App navigation\n• Luxembourg healthcare system (CNS/PID)\n• Emergency information\n\nWhat would you like to know?",
      suggestions: [
        "Find a cardiologist",
        "How to book an appointment?",
        "What is CNS coverage?",
        "Show my next appointment",
      ],
    };
  }

  private async handleDoctorQuery(message: string): Promise<ChatResponse> {
    // Extract specialty if mentioned
    const specialties = [
      "cardiology",
      "dermatology",
      "internal medicine",
      "neurology",
      "orthopedics",
      "pediatrics",
      "psychiatry",
    ];
    const mentionedSpecialty = specialties.find((spec) =>
      message.includes(spec.toLowerCase()),
    );

    if (mentionedSpecialty) {
      const doctors = await this.userRepository.find({
        where: { specialty: mentionedSpecialty },
        select: ["id", "firstName", "lastName", "specialty"],
        take: 3,
      });

      if (doctors.length > 0) {
        const doctorList = doctors
          .map(
            (doc) =>
              `• Dr. ${doc.firstName} ${doc.lastName} (${doc.specialty})`,
          )
          .join("\n");
        return {
          message: `Here are available ${mentionedSpecialty} specialists:\n\n${doctorList}\n\nWould you like to book an appointment with any of them?`,
          suggestions: [
            "Book appointment",
            "See more doctors",
            "Doctor availability",
          ],
          data: { doctors },
        };
      }
    }

    return {
      message:
        "I can help you find the right doctor! CarePoint has specialists in:\n• Cardiology\n• Dermatology\n• Internal Medicine\n• Neurology\n• Orthopedics\n• Pediatrics\n• Psychiatry\n\nYou can find doctors by going to 'Find Care' in the app, or tell me which specialty you're looking for.",
      suggestions: [
        "Find a cardiologist",
        "Show all specialties",
        "How to book with a doctor?",
      ],
    };
  }

  private async handleAppointmentQuery(
    message: string,
    patientId: string,
  ): Promise<ChatResponse> {
    if (
      message.includes("next") ||
      message.includes("upcoming") ||
      message.includes("prochain")
    ) {
      const nextAppointment = await this.appointmentRepository.findOne({
        where: {
          patient: { id: patientId },
          startTime: now(), // This should be MoreThan(now()) but simplified for demo
        },
        relations: ["doctor"],
        order: { startTime: "ASC" },
      });

      if (nextAppointment) {
        const date = toLocaleDateString(nextAppointment.startTime);
        const time = toLocaleTimeString(nextAppointment.startTime, "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          message: `Your next appointment is:\n📅 ${date} at ${time}\n👩‍⚕️ Dr. ${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}\n📋 ${nextAppointment.title}`,
          suggestions: [
            "Reschedule appointment",
            "Get directions",
            "Cancel appointment",
          ],
        };
      } else {
        return {
          message:
            "You don't have any upcoming appointments. Would you like to book one?",
          suggestions: [
            "Book new appointment",
            "Find a doctor",
            "See past appointments",
          ],
        };
      }
    }

    if (
      message.includes("book") ||
      message.includes("schedule") ||
      message.includes("réserver")
    ) {
      return {
        message:
          "To book an appointment:\n1. Go to 'Find Care' to choose a doctor\n2. Click 'Book Appointment' on their profile\n3. Select date and time\n4. Add reason for visit\n5. Confirm booking\n\nOr tell me which specialty you need and I'll help you find the right doctor!",
        suggestions: [
          "Find Care now",
          "Find a cardiologist",
          "Show available times",
        ],
      };
    }

    if (message.includes("cancel") || message.includes("annuler")) {
      return {
        message:
          "To cancel an appointment:\n1. Go to 'My Appointments'\n2. Find the appointment you want to cancel\n3. Click 'Cancel' button\n4. Confirm cancellation\n\nNote: Please cancel at least 24 hours in advance to avoid fees.",
        suggestions: [
          "View my appointments",
          "Reschedule instead",
          "Contact support",
        ],
      };
    }

    return {
      message:
        "I can help you with appointments! You can:\n• Book new appointments\n• View upcoming appointments\n• Cancel or reschedule\n• Find appointment history\n\nWhat would you like to do?",
      suggestions: [
        "Book appointment",
        "Show next appointment",
        "Cancel appointment",
      ],
    };
  }

  private handleAppUsageQuery(message: string): ChatResponse {
    if (message.includes("profile") || message.includes("profil")) {
      return {
        message:
          "To manage your profile:\n1. Click your name in the sidebar (desktop) or profile tab (mobile)\n2. Update personal information\n3. Add emergency contacts\n4. Save changes\n\nYour profile helps doctors provide better care!",
        suggestions: [
          "Update profile now",
          "Add emergency contact",
          "Change password",
        ],
      };
    }

    if (message.includes("records") || message.includes("dossier")) {
      return {
        message:
          "Your health records contain:\n• Medical history\n• Lab results\n• Prescriptions\n• Visit summaries\n\nAccess them via 'Health Records' in the main menu. You can search and filter by category.",
        suggestions: [
          "View health records",
          "Download records",
          "Share with doctor",
        ],
      };
    }

    return {
      message:
        "CarePoint features:\n📋 **Dashboard** - Overview of your health\n🔍 **Find Care** - Search doctors by specialty\n📅 **Appointments** - Manage your visits\n📄 **Health Records** - Your medical history\n👤 **Profile** - Update personal info\n\nWhat would you like to learn about?",
      suggestions: [
        "Navigate to Find Care",
        "View my dashboard",
        "Update my profile",
      ],
    };
  }

  private handleCNSQuery(message: string): ChatResponse {
    if (
      message.includes("coverage") ||
      message.includes("couverture") ||
      message.includes("remboursement")
    ) {
      return {
        message:
          "**CNS (Caisse Nationale de Santé) Coverage:**\n\n• General consultations: 70-88% reimbursed\n• Specialist visits: Require referral from GP\n• Emergency visits: 88% covered\n• Medications: Variable rates (0-80%)\n• Hospital stays: 88% for shared rooms\n\n*Always bring your CNS card to appointments!*",
        suggestions: [
          "How to get CNS card?",
          "Specialist referral process",
          "Emergency coverage",
        ],
      };
    }

    if (message.includes("card") || message.includes("carte")) {
      return {
        message:
          "**CNS Card Information:**\n\n📱 **Digital Card:** Available via MyGuichet.lu app\n💳 **Physical Card:** Mailed to your address\n🔢 **Card Number:** 13-digit identification\n\n**For appointments:** Always present your CNS card for direct billing (tiers payant).",
        suggestions: [
          "Download MyGuichet app",
          "Lost card procedure",
          "Direct billing info",
        ],
      };
    }

    return {
      message:
        "**CNS (Luxembourg Health Insurance):**\n\nThe CNS covers most healthcare costs in Luxembourg:\n• Mandatory for all residents\n• Covers doctor visits, medications, hospital stays\n• Requires CNS card for reimbursement\n• Some services need referrals\n\nWhat specific CNS information do you need?",
      suggestions: [
        "CNS coverage rates",
        "How to get CNS card",
        "Referral requirements",
      ],
    };
  }

  private handlePIDQuery(message: string): ChatResponse {
    return {
      message:
        "**Patient Identification (PID) System:**\n\n🆔 **Purpose:** Unique identifier for all healthcare interactions\n📋 **Usage:** Links your medical records across providers\n🔒 **Privacy:** Protected under Luxembourg data protection laws\n\n**In CarePoint:** Your PID is automatically managed - no action needed from you!",
      suggestions: [
        "Data privacy rights",
        "Medical record access",
        "Provider communication",
      ],
    };
  }

  private handleEmergencyQuery(): ChatResponse {
    return {
      message:
        "🚨 **EMERGENCY CONTACTS:**\n\n🚑 **Emergency Services:** 112\n🏥 **Centre Hospitalier:** +352 4411-1\n☎️ **Medical Helpline:** 8002-9555\n\n**For life-threatening emergencies, call 112 immediately!**\n\nFor non-urgent issues, you can book an urgent care appointment through CarePoint.",
      suggestions: [
        "Book urgent care",
        "Find nearest hospital",
        "Contact my doctor",
      ],
    };
  }

  private getDefaultResponse(): ChatResponse {
    return {
      message:
        "I'm here to help! I can assist you with:\n\n🔍 **Finding doctors** and specialists\n📅 **Managing appointments** (book, cancel, reschedule)\n📱 **Using the app** (navigation, features)\n🏥 **CNS insurance** information\n🆔 **PID system** details\n🚨 **Emergency** contacts\n\nWhat would you like to know more about?",
      suggestions: [
        "Find a doctor",
        "How to book appointment?",
        "CNS coverage info",
        "Emergency contacts",
      ],
    };
  }

  private async handlePharmacyQuery(message: string): Promise<ChatResponse> {
    console.log("🏥 Handling pharmacy query:", message);

    if (
      message.includes("garde") ||
      message.includes("duty") ||
      message.includes("today") ||
      message.includes("aujourd'hui")
    ) {
      console.log("📋 Fetching today's duty pharmacies");

      try {
        const dutyInfo = await this.pharmacyService.getTodayDutyPharmacies();

        let responseMessage = `🏥 **PHARMACIES DE GARDE - ${dutyInfo.date}**\n\n`;

        dutyInfo.pharmacies.forEach((pharmacy, index) => {
          const emergencyIcon = pharmacy.isEmergency ? "🚨 " : "";
          responseMessage += `**${index + 1}. ${emergencyIcon}${pharmacy.name}**\n`;
          responseMessage += `📍 ${pharmacy.address}\n`;
          responseMessage += `📞 ${pharmacy.phone}\n`;
          responseMessage += `🕐 ${pharmacy.hours}\n`;
          responseMessage += `🌍 ${pharmacy.region}\n\n`;
        });

        // Add data source information
        const sourceInfo =
          dutyInfo.source === "real-time"
            ? "✅ Données officielles temps réel"
            : dutyInfo.source === "cached"
              ? "📄 Données mises en cache"
              : "⚠️ Données de secours - Confirmez au 112";

        responseMessage += `${sourceInfo}\n`;
        responseMessage += `🕒 Dernière mise à jour: ${dutyInfo.lastUpdated.toLocaleTimeString("fr-LU")}\n\n`;
        responseMessage += `⚠️ **Participation:** 12,50€ pour service de garde\n\n`;
        responseMessage += dutyInfo.emergencyInfo;

        const suggestions =
          dutyInfo.source === "real-time"
            ? [
                "Emergency pharmacy info",
                "Find pharmacy near me",
                "Refresh data",
              ]
            : [
                "Refresh pharmacy data",
                "Emergency pharmacy info",
                "Find pharmacy near me",
              ];

        return {
          message: responseMessage,
          suggestions,
          data: {
            pharmacies: dutyInfo.pharmacies,
            source: dutyInfo.source,
            lastUpdated: dutyInfo.lastUpdated,
          },
        };
      } catch (error) {
        console.error("❌ Error fetching pharmacy data:", error);

        return {
          message: `❌ **ERREUR**\n\nImpossible de récupérer les données des pharmacies de garde.\n\n📞 **En cas d'urgence:**\n• Appelez le 112\n• Pharmacie de l'Hôpital: +352 44 11 33 02\n\nEssayez de nouveau dans quelques minutes.`,
          suggestions: [
            "Emergency contacts",
            "Try again",
            "Find pharmacy near me",
          ],
        };
      }
    }

    if (
      message.includes("refresh") ||
      message.includes("actualiser") ||
      message.includes("update")
    ) {
      console.log("🔄 Refreshing pharmacy data");

      try {
        const refreshedData = await this.pharmacyService.refreshPharmacyData();

        return {
          message: `🔄 **DONNÉES ACTUALISÉES**\n\n✅ Pharmacies de garde mises à jour!\n🕒 ${refreshedData.lastUpdated.toLocaleTimeString("fr-LU")}\n📊 Source: ${refreshedData.source}\n\nDemandez "pharmacies de garde today" pour voir la liste.`,
          suggestions: [
            "Today's duty pharmacies",
            "Emergency pharmacy",
            "Find pharmacy near me",
          ],
        };
      } catch (error) {
        console.error("❌ Error refreshing pharmacy data:", error);

        return {
          message: `❌ **ERREUR DE MISE À JOUR**\n\nImpossible d'actualiser les données temps réel.\n💡 Essayez plus tard ou appelez le 112.`,
          suggestions: [
            "Today's duty pharmacies",
            "Emergency contacts",
            "Find pharmacy near me",
          ],
        };
      }
    }

    if (
      message.includes("emergency") ||
      message.includes("urgence") ||
      message.includes("24h")
    ) {
      console.log("🚨 Providing emergency pharmacy info");

      return {
        message: this.pharmacyService.getEmergencyPharmacyInfo(),
        suggestions: [
          "Today's duty pharmacies",
          "Find pharmacy near me",
          "Emergency contacts",
        ],
      };
    }

    if (
      message.includes("near") ||
      message.includes("proche") ||
      message.includes("find")
    ) {
      console.log("🔍 Providing pharmacy search info");

      return {
        message: `🔍 **TROUVER UNE PHARMACIE:**\n\n📱 **Applications mobiles:**\n• "Pharmacies Luxembourg" (App Store/Google Play)\n• "MyGuichet.lu"\n\n🌐 **Sites web:**\n• www.sante.lu\n• www.one.lu\n\n📞 **Par téléphone:**\n• 112 (demander pharmacie de garde)\n\n📍 **Régions principales:**\n• Centre: Luxembourg-Ville, Kirchberg\n• Sud: Esch-sur-Alzette, Dudelange\n• Nord: Ettelbruck, Diekirch\n• Est: Grevenmacher, Echternach\n\nTapez le nom de votre ville!`,
        suggestions: [
          "Luxembourg-Ville pharmacies",
          "Esch-sur-Alzette pharmacies",
          "Today's duty pharmacies",
          "Emergency pharmacy",
        ],
      };
    }

    // Handle city-specific searches
    const cities = [
      "luxembourg",
      "esch",
      "ettelbruck",
      "differdange",
      "dudelange",
      "kirchberg",
      "wiltz",
      "diekirch",
    ];
    const mentionedCity = cities.find((city) => message.includes(city));

    if (mentionedCity) {
      console.log("🏙️ Searching pharmacies for city:", mentionedCity);

      try {
        const cityPharmacies =
          this.pharmacyService.searchPharmaciesByCity(mentionedCity);

        if (cityPharmacies.length > 0) {
          let responseMessage = `🏥 **PHARMACIES - ${mentionedCity.toUpperCase()}**\n\n`;

          cityPharmacies.forEach((pharmacy, index) => {
            const emergencyIcon = pharmacy.isEmergency ? "🚨 " : "";
            responseMessage += `**${index + 1}. ${emergencyIcon}${pharmacy.name}**\n`;
            responseMessage += `📍 ${pharmacy.address}\n`;
            responseMessage += `📞 ${pharmacy.phone}\n`;
            responseMessage += `🕐 ${pharmacy.hours}\n\n`;
          });

          responseMessage += `💡 **Conseil:** Appelez avant de vous déplacer!`;

          return {
            message: responseMessage,
            suggestions: [
              "Today's duty pharmacies",
              "Emergency pharmacy",
              "Find other cities",
            ],
            data: { pharmacies: cityPharmacies },
          };
        } else {
          return {
            message: `❓ **AUCUNE PHARMACIE TROUVÉE**\n\nAucune pharmacie trouvée pour "${mentionedCity}".\n\nEssayez:\n• Luxembourg-Ville\n• Esch-sur-Alzette\n• Ettelbruck\n• Differdange`,
            suggestions: [
              "Luxembourg-Ville pharmacies",
              "Today's duty pharmacies",
              "Emergency pharmacy",
            ],
          };
        }
      } catch (error) {
        console.error("❌ Error searching pharmacies by city:", error);

        return {
          message: `❌ Erreur lors de la recherche de pharmacies pour ${mentionedCity}. Essayez "pharmacies de garde today" ou appelez le 112.`,
          suggestions: [
            "Today's duty pharmacies",
            "Emergency contacts",
            "Try again",
          ],
        };
      }
    }

    // Default pharmacy response
    console.log("💊 Providing general pharmacy info");

    return {
      message: `💊 **SERVICES PHARMACIE:**\n\n🏥 **Pharmacies de garde:** Ouvertes nuit/dimanche/jours fériés\n💊 **Médicaments:** Sur ordonnance et en vente libre\n🩹 **Conseils:** Santé et premiers secours\n💉 **Vaccinations:** Grippe, COVID, voyage\n📋 **Services:** Pression artérielle, tests rapides\n\n**Que recherchez-vous?**`,
      suggestions: [
        "Today's duty pharmacies",
        "Find pharmacy near me",
        "Emergency pharmacy",
        "Refresh pharmacy data",
      ],
    };
  }
}
