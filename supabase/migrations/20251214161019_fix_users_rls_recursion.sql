/*
  # Fix Infinite Recursion in Users RLS Policies
  
  The previous RLS policies for the users table were causing infinite recursion
  because they queried the users table to check admin status, which triggered
  the same policy check again.
  
  Solution:
  1. Create a SECURITY DEFINER function to check admin status (bypasses RLS)
  2. Drop existing problematic policies
  3. Recreate policies using the new function
  
  This ensures policies can check user roles without triggering recursive RLS checks.
*/

-- Create a SECURITY DEFINER function to check if current user is admin
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Recreate policies using the is_admin() function
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update other policies that check for admin role to use the function
-- Products policies
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers policies
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update customers" ON customers;

CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Delivery persons policies
DROP POLICY IF EXISTS "Admins can insert delivery persons" ON delivery_persons;
DROP POLICY IF EXISTS "Admins can update delivery persons" ON delivery_persons;

CREATE POLICY "Admins can insert delivery persons"
  ON delivery_persons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update delivery persons"
  ON delivery_persons FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order items policies
DROP POLICY IF EXISTS "Admins can insert order items" ON order_items;

CREATE POLICY "Admins can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Update order items select policy to use is_admin()
DROP POLICY IF EXISTS "Users can view order items of accessible orders" ON order_items;

CREATE POLICY "Users can view order items of accessible orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (
        public.is_admin()
        OR
        EXISTS (
          SELECT 1 FROM delivery_assignments da
          JOIN delivery_persons dp ON dp.id = da.delivery_person_id
          WHERE da.order_id = o.id AND dp.user_id = auth.uid()
        )
      )
    )
  );

-- Delivery assignments policies
DROP POLICY IF EXISTS "Admins can view all assignments" ON delivery_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON delivery_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON delivery_assignments;

CREATE POLICY "Admins can view all assignments"
  ON delivery_assignments FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert assignments"
  ON delivery_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update assignments"
  ON delivery_assignments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order status history policies
DROP POLICY IF EXISTS "Users can view history of accessible orders" ON order_status_history;
DROP POLICY IF EXISTS "Admins can insert status updates" ON order_status_history;

CREATE POLICY "Users can view history of accessible orders"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_status_history.order_id AND (
        public.is_admin()
        OR
        EXISTS (
          SELECT 1 FROM delivery_assignments da
          JOIN delivery_persons dp ON dp.id = da.delivery_person_id
          WHERE da.order_id = o.id AND dp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can insert status updates"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

