-- Run this in the Supabase SQL editor (or `psql`) against your production database
-- AFTER `prisma migrate deploy` has created the `users` table.
--
-- It rotates the admin password and creates one tailor account.
-- The password hashes below are bcrypt hashes (cost factor 10) for these plaintext passwords —
-- save them somewhere safe (a password manager), they are not recoverable from the hash:
--
--   Admin  — admin@fakirefashion.local  /  N0xat2w8rZML!x2
--   Tailor — tailor@fakirefashion.local /  4dqyRbxnNXgA!x2
--
-- Change the emails below first if you want different addresses.

-- 1. Rotate the admin password (assumes the admin row already exists from `prisma db seed`)
UPDATE users
SET "passwordHash" = '$2b$10$4WjIrVqdEIrhV0Wfhuomw.vczDZ0lE5Wwq6O8YlPsWI5p3W1qKg2q'
WHERE email = 'admin@fakirefashion.local';

-- 2. Create the tailor account (insert only if it doesn't already exist)
INSERT INTO users (name, email, "passwordHash", role, "createdAt")
VALUES ('Tailor', 'tailor@fakirefashion.local', '$2b$10$lN2KEaBipuE.SvuV23UN0OHjqu./eiCj3cHxgbZxn8HX8dzuMUBjW', 'tailor', now())
ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = 'tailor';

-- To rotate a password to something else later, generate a new bcrypt hash (cost 10) with:
--   node -e "console.log(require('bcryptjs').hashSync('your-new-password', 10))"
-- and swap it into an UPDATE like statement (1) above.
