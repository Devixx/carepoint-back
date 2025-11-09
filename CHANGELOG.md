# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Doctor Social Media Integration**: Added social media links (Facebook, Twitter, LinkedIn, Instagram, Website) to doctor profiles
  - Updated User entity with `socialMedia` field
  - Seed service now includes real social media accounts from famous healthcare organizations for testing
  - Added social media DTOs for validation

- **Doctor Vacation/Time-Off Management**: Doctors can now set vacation periods that affect their availability
  - Added `vacations` field to User entity with start date, end date, and optional reason
  - Availability API now checks if doctor is on vacation before showing time slots
  - When on vacation, API returns `onVacation: true` flag and vacation reason
  - Seed service includes sample vacation data for all doctors with realistic dates
  - Patients can see when doctors are unavailable due to vacation

- **Doctor Settings & Profile Management**: Enhanced doctor profile customization
  - Added doctor settings controller for managing working hours, appointment settings, and profile information
  - Added DTOs for working hours, appointment settings, consultation types, and doctor profiles
  - Doctors can configure their availability, consultation types, and appointment durations

- **Database Utilities**: Added fix-null-appointments script for data maintenance

### Modified
- Enhanced seed service with comprehensive test data including social media and vacation schedules
- Updated appointments service to validate doctor availability against vacation schedules
- Improved date handling utilities for vacation date comparisons

### Technical Changes
- Added new DTOs: `SocialMediaDto`, `VacationDto`, `WorkingHoursDto`, `AppointmentSettingsDto`, `ConsultationTypeDto`, `DoctorProfileDto`
- Enhanced User entity with `socialMedia` and `vacations` JSON columns
- Updated appointment availability logic to include vacation checking

## Testing
- All doctors in seed data now have social media links pointing to real healthcare organization accounts
- Vacation periods are set relative to current date for easy testing
- Dr. Robert Martinez has no vacations for baseline testing


