-- Fix role for existing accounts that were saved as lowercase
UPDATE "UserCredentials"
SET role = UPPER(role)
WHERE role != UPPER(role);

-- Confirm result
SELECT email, role FROM "UserCredentials";
