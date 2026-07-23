-- Fix RLS policies to allow INSERT and UPDATE with proper WITH CHECK clauses.
-- Previous policies only had USING, which blocks INSERT operations (causing 409 errors).

-- Profiles
DROP POLICY IF EXISTS "Users can CRUD own profiles" ON profiles;
CREATE POLICY "Users can CRUD own profiles" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Expenses
DROP POLICY IF EXISTS "Users can CRUD own expenses" ON expenses;
CREATE POLICY "Users can CRUD own expenses" ON expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Incomes
DROP POLICY IF EXISTS "Users can CRUD own incomes" ON incomes;
CREATE POLICY "Users can CRUD own incomes" ON incomes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budgets
DROP POLICY IF EXISTS "Users can CRUD own budgets" ON budgets;
CREATE POLICY "Users can CRUD own budgets" ON budgets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recurring payments
DROP POLICY IF EXISTS "Users can CRUD own recurring_payments" ON recurring_payments;
CREATE POLICY "Users can CRUD own recurring_payments" ON recurring_payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
