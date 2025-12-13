/*
  # Add Default Admin User
  
  Creates a default admin account for initial system access.
  
  1. Admin Credentials
    - Email: admin@stockmanager.com
    - Password: Admin@123456
    - Role: admin
    - Full Name: System Administrator
  
  2. Security Notes
    - Password is securely hashed using Supabase auth
    - User is marked as email confirmed for immediate access
    - IMPORTANT: Change password after first login for security
  
  3. User Profile
    - Creates corresponding profile in public.users table
    - Sets role as 'admin' for full system access
*/

-- Enable required extensions if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  END IF;
END $$;

-- Create admin user in auth.users
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
  hashed_password text;
BEGIN
  -- Generate password hash for 'Admin@123456'
  hashed_password := crypt('Admin@123456', gen_salt('bf'));
  
  -- Insert into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@stockmanager.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@stockmanager.com',
      hashed_password,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    
    -- Insert corresponding profile in public.users
    INSERT INTO public.users (
      id,
      email,
      role,
      full_name,
      phone,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@stockmanager.com',
      'admin',
      'System Administrator',
      '+1234567890',
      now(),
      now()
    );
  END IF;
END $$;
