-- SQL Script to Add Test Vacation Data to Doctors
-- Run this script to add vacation data to your test doctors

-- Example 1: Add upcoming vacation to a doctor
-- Replace 'doctor-uuid-here' with an actual doctor ID from your database
UPDATE users 
SET vacations = '[
  {
    "startDate": "2025-11-20",
    "endDate": "2025-11-25",
    "reason": "Medical Conference"
  },
  {
    "startDate": "2025-12-24",
    "endDate": "2026-01-02",
    "reason": "Holiday Break"
  }
]'::json
WHERE role = 'doctor' 
  AND email = 'doctor1@example.com';

-- Example 2: Add current vacation (doctor is on vacation now)
-- This will show the "On Vacation" badge
UPDATE users 
SET vacations = '[
  {
    "startDate": "2025-11-08",
    "endDate": "2025-11-12",
    "reason": "Personal Leave"
  },
  {
    "startDate": "2025-12-15",
    "endDate": "2025-12-20",
    "reason": "Family Emergency"
  }
]'::json
WHERE role = 'doctor' 
  AND email = 'doctor2@example.com';

-- Example 3: Add vacation without reason
UPDATE users 
SET vacations = '[
  {
    "startDate": "2025-11-18",
    "endDate": "2025-11-22"
  }
]'::json
WHERE role = 'doctor' 
  AND email = 'doctor3@example.com';

-- Example 4: Add multiple vacations
UPDATE users 
SET vacations = '[
  {
    "startDate": "2025-11-15",
    "endDate": "2025-11-16",
    "reason": "Workshop"
  },
  {
    "startDate": "2025-12-10",
    "endDate": "2025-12-12",
    "reason": "Training"
  },
  {
    "startDate": "2026-01-20",
    "endDate": "2026-01-27",
    "reason": "Annual Leave"
  }
]'::json
WHERE role = 'doctor' 
  AND email = 'doctor4@example.com';

-- View all doctors with their vacations
SELECT 
  id,
  CONCAT(first_name, ' ', last_name) as doctor_name,
  email,
  specialty,
  vacations
FROM users
WHERE role = 'doctor'
  AND vacations IS NOT NULL;

-- Clear vacations from a doctor (if needed for testing)
-- UPDATE users 
-- SET vacations = NULL
-- WHERE role = 'doctor' 
--   AND email = 'doctor1@example.com';

-- Alternative: Update by ID instead of email
-- UPDATE users 
-- SET vacations = '[{"startDate": "2025-11-20", "endDate": "2025-11-25", "reason": "Conference"}]'::json
-- WHERE id = 'your-doctor-uuid-here';

