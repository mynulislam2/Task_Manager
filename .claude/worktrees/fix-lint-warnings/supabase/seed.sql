-- ============================================================
-- FinTrack — Seed Data (Run in Supabase SQL Editor)
-- ============================================================
-- How to use:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Run it
-- 4. Then log into the app with the email/password below
-- ============================================================

-- ─── CONFIG ──────────────────────────────────────────────────
-- Change these if needed:
DO $$
DECLARE
  v_email TEXT := 'mynulislamridoy@gmail.com';
  v_password TEXT := '1232Mynul@';
  v_name TEXT := 'Mynul Islam';
  v_user_id UUID;
  v_now DATE := CURRENT_DATE;
  v_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  v_count_expenses INT := 0;
  v_count_incomes INT := 0;
  v_count_budgets INT := 0;
  v_count_recurring INT := 0;
BEGIN

  -- ─── CREATE USER ──────────────────────────────────────────
  -- Note: If this fails, first create the user manually in
  -- Authentication > Add User with email/password above,
  -- then run again (the INSERT will use the existing user).

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at, confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', v_name),
    NOW(), NOW()
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_user_id;

  -- If user already existed, get their ID
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  END IF;

  RAISE NOTICE 'User ID: %', v_user_id;

  -- ─── PROFILE ──────────────────────────────────────────────
  INSERT INTO public.profiles (id, name, email, currency)
  VALUES (v_user_id, v_name, v_email, 'USD')
  ON CONFLICT (id) DO UPDATE SET name = v_name, email = v_email, currency = 'USD';

  -- ─── DELETE OLD SEED DATA ─────────────────────────────────
  DELETE FROM public.expenses WHERE user_id = v_user_id;
  DELETE FROM public.incomes WHERE user_id = v_user_id;
  DELETE FROM public.budgets WHERE user_id = v_user_id;
  DELETE FROM public.recurring_payments WHERE user_id = v_user_id;

  -- ─── BUDGETS (7 categories) ───────────────────────────────
  INSERT INTO public.budgets (user_id, category, limit_amount, month) VALUES
    (v_user_id, 'Food', 15000, v_month),
    (v_user_id, 'Transport', 8000, v_month),
    (v_user_id, 'Shopping', 20000, v_month),
    (v_user_id, 'Bills', 18000, v_month),
    (v_user_id, 'Health', 10000, v_month),
    (v_user_id, 'Entertainment', 8000, v_month),
    (v_user_id, 'Other', 5000, v_month);
  GET DIAGNOSTICS v_count_budgets = ROW_COUNT;

  -- ─── RECURRING PAYMENTS (8 items) ─────────────────────────
  INSERT INTO public.recurring_payments (user_id, name, amount, category, frequency, start_date, next_date, is_paused) VALUES
    (v_user_id, 'Netflix Standard', 649, 'Entertainment', 'monthly', '2025-01-15', (DATE_TRUNC('month', v_now) + INTERVAL '14 days')::DATE, FALSE),
    (v_user_id, 'Apartment Rent', 25000, 'Bills', 'monthly', '2024-06-01', (DATE_TRUNC('month', v_now))::DATE, FALSE),
    (v_user_id, 'Internet Fiber', 1500, 'Bills', 'monthly', '2024-06-01', (DATE_TRUNC('month', v_now) + INTERVAL '4 days')::DATE, FALSE),
    (v_user_id, 'Gym Membership', 2500, 'Health', 'monthly', '2025-03-01', (DATE_TRUNC('month', v_now) + INTERVAL '9 days')::DATE, FALSE),
    (v_user_id, 'Cloud Storage (Google)', 450, 'Bills', 'monthly', '2025-01-01', (DATE_TRUNC('month', v_now) + INTERVAL '11 days')::DATE, FALSE),
    (v_user_id, 'Spotify Premium', 299, 'Entertainment', 'monthly', '2025-02-01', (DATE_TRUNC('month', v_now) + INTERVAL '19 days')::DATE, FALSE),
    (v_user_id, 'Car Insurance', 18000, 'Transport', 'yearly', '2025-08-01', '2026-08-01', FALSE),
    (v_user_id, 'Domain & Hosting', 3500, 'Bills', 'yearly', '2025-11-01', '2026-11-01', FALSE);
  GET DIAGNOSTICS v_count_recurring = ROW_COUNT;

  -- ─── INCOME (13 entries across 3 months) ──────────────────
  INSERT INTO public.incomes (user_id, source, amount, date, notes) VALUES
    (v_user_id, 'Salary', 85000, v_now - INTERVAL '2 months' + INTERVAL '27 days', 'Monthly salary - Tech Corp'),
    (v_user_id, 'Salary', 85000, v_now - INTERVAL '1 month' + INTERVAL '27 days', 'Monthly salary - Tech Corp'),
    (v_user_id, 'Salary', 85000, v_now - INTERVAL '0 months' + INTERVAL '27 days', 'Monthly salary - Tech Corp'),
    (v_user_id, 'Freelance', 25000, v_now - INTERVAL '2 months' + INTERVAL '5 days', 'Freelance Project - Web App'),
    (v_user_id, 'Freelance', 12000, v_now - INTERVAL '1 month' + INTERVAL '12 days', 'Freelance - UI Design'),
    (v_user_id, 'Freelance', 8000, v_now - INTERVAL '0 months' + INTERVAL '19 days', 'Consultation Fee'),
    (v_user_id, 'Freelance', 18000, v_now - INTERVAL '2 months' + INTERVAL '18 days', 'Freelance - API Integration'),
    (v_user_id, 'Freelance', 35000, v_now - INTERVAL '1 month' + INTERVAL '7 days', 'Freelance - Mobile App'),
    (v_user_id, 'Freelance', 5000, v_now - INTERVAL '0 months' + INTERVAL '3 days', 'Technical Writing'),
    (v_user_id, 'Freelance', 6000, v_now - INTERVAL '1 month' + INTERVAL '24 days', 'Freelance - Code Review'),
    (v_user_id, 'Investment', 3200, v_now - INTERVAL '2 months' + INTERVAL '14 days', 'Dividend & stock returns'),
    (v_user_id, 'Investment', 2800, v_now - INTERVAL '1 month' + INTERVAL '14 days', 'Dividend & stock returns'),
    (v_user_id, 'Investment', 4100, v_now - INTERVAL '0 months' + INTERVAL '14 days', 'Dividend & stock returns');
  GET DIAGNOSTICS v_count_incomes = ROW_COUNT;

  -- ─── EXPENSES (~150 entries across 3 months) ──────────────
  -- Food (12 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Lunch at Café', 450, 'Food', v_now - INTERVAL '2 months' + INTERVAL '2 days', 'UPI'),
    (v_user_id, 'Grocery Store', 2850, 'Food', v_now - INTERVAL '2 months' + INTERVAL '4 days', 'Debit Card'),
    (v_user_id, 'Pizza Delivery', 890, 'Food', v_now - INTERVAL '2 months' + INTERVAL '7 days', 'UPI'),
    (v_user_id, 'Coffee & Snacks', 320, 'Food', v_now - INTERVAL '2 months' + INTERVAL '9 days', 'Cash'),
    (v_user_id, 'Dinner at Restaurant', 2100, 'Food', v_now - INTERVAL '2 months' + INTERVAL '12 days', 'Credit Card'),
    (v_user_id, 'Weekly Groceries', 3200, 'Food', v_now - INTERVAL '2 months' + INTERVAL '14 days', 'Debit Card'),
    (v_user_id, 'Breakfast Cafe', 380, 'Food', v_now - INTERVAL '2 months' + INTERVAL '16 days', 'Cash'),
    (v_user_id, 'BBQ Night', 1800, 'Food', v_now - INTERVAL '2 months' + INTERVAL '19 days', 'UPI'),
    (v_user_id, 'Supermarket', 4100, 'Food', v_now - INTERVAL '2 months' + INTERVAL '21 days', 'Credit Card'),
    (v_user_id, 'Sushi Takeout', 1200, 'Food', v_now - INTERVAL '2 months' + INTERVAL '24 days', 'UPI'),
    (v_user_id, 'Lunch Meeting', 650, 'Food', v_now - INTERVAL '2 months' + INTERVAL '26 days', 'UPI'),
    (v_user_id, 'Farmers Market', 1200, 'Food', v_now - INTERVAL '2 months' + INTERVAL '28 days', 'Cash'),
    (v_user_id, 'Lunch at Café', 450, 'Food', v_now - INTERVAL '1 month' + INTERVAL '3 days', 'UPI'),
    (v_user_id, 'Grocery Store', 2850, 'Food', v_now - INTERVAL '1 month' + INTERVAL '5 days', 'Debit Card'),
    (v_user_id, 'Pizza Delivery', 890, 'Food', v_now - INTERVAL '1 month' + INTERVAL '8 days', 'UPI'),
    (v_user_id, 'Coffee & Snacks', 320, 'Food', v_now - INTERVAL '1 month' + INTERVAL '10 days', 'Cash'),
    (v_user_id, 'Dinner at Restaurant', 2100, 'Food', v_now - INTERVAL '1 month' + INTERVAL '13 days', 'Credit Card'),
    (v_user_id, 'Bakery', 450, 'Food', v_now - INTERVAL '1 month' + INTERVAL '15 days', 'Cash'),
    (v_user_id, 'Weekly Groceries', 3200, 'Food', v_now - INTERVAL '1 month' + INTERVAL '17 days', 'Debit Card'),
    (v_user_id, 'BBQ Night', 1800, 'Food', v_now - INTERVAL '1 month' + INTERVAL '20 days', 'UPI'),
    (v_user_id, 'Supermarket', 4100, 'Food', v_now - INTERVAL '1 month' + INTERVAL '22 days', 'Credit Card'),
    (v_user_id, 'Thai Food', 950, 'Food', v_now - INTERVAL '1 month' + INTERVAL '24 days', 'UPI'),
    (v_user_id, 'Lunch Meeting', 650, 'Food', v_now - INTERVAL '1 month' + INTERVAL '27 days', 'UPI'),
    (v_user_id, 'Ice Cream', 180, 'Food', v_now - INTERVAL '1 month' + INTERVAL '29 days', 'Cash'),
    (v_user_id, 'Lunch at Café', 520, 'Food', v_now - INTERVAL '0 months' + INTERVAL '2 days', 'UPI'),
    (v_user_id, 'Grocery Store', 3100, 'Food', v_now - INTERVAL '0 months' + INTERVAL '4 days', 'Debit Card'),
    (v_user_id, 'Sushi Takeout', 1200, 'Food', v_now - INTERVAL '0 months' + INTERVAL '7 days', 'UPI'),
    (v_user_id, 'Coffee & Snacks', 320, 'Food', v_now - INTERVAL '0 months' + INTERVAL '9 days', 'Cash'),
    (v_user_id, 'Dinner at Restaurant', 2150, 'Food', v_now - INTERVAL '0 months' + INTERVAL '11 days', 'Credit Card'),
    (v_user_id, 'Bakery', 450, 'Food', v_now - INTERVAL '0 months' + INTERVAL '14 days', 'Cash'),
    (v_user_id, 'Weekly Groceries', 3350, 'Food', v_now - INTERVAL '0 months' + INTERVAL '16 days', 'Debit Card'),
    (v_user_id, 'Pizza Delivery', 890, 'Food', v_now - INTERVAL '0 months' + INTERVAL '18 days', 'UPI'),
    (v_user_id, 'Farmers Market', 1200, 'Food', v_now - INTERVAL '0 months' + INTERVAL '21 days', 'Cash'),
    (v_user_id, 'Breakfast Cafe', 380, 'Food', v_now - INTERVAL '0 months' + INTERVAL '23 days', 'Cash'),
    (v_user_id, 'Thai Food', 950, 'Food', v_now - INTERVAL '0 months' + INTERVAL '26 days', 'UPI'),
    (v_user_id, 'Ice Cream', 180, 'Food', v_now - INTERVAL '0 months' + INTERVAL '28 days', 'Cash');

  -- Transport (8 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Uber Ride', 350, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '3 days', 'UPI'),
    (v_user_id, 'Fuel Station', 3500, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '6 days', 'Debit Card'),
    (v_user_id, 'Auto Rickshaw', 120, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '10 days', 'Cash'),
    (v_user_id, 'Train Ticket', 780, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '13 days', 'UPI'),
    (v_user_id, 'Metro Card Top-up', 300, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '17 days', 'Cash'),
    (v_user_id, 'Bike Service', 2200, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '20 days', 'Cash'),
    (v_user_id, 'Parking Fee', 150, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '24 days', 'Cash'),
    (v_user_id, 'Car Wash', 400, 'Transport', v_now - INTERVAL '2 months' + INTERVAL '28 days', 'Cash'),
    (v_user_id, 'Uber Ride', 380, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '2 days', 'UPI'),
    (v_user_id, 'Bus Pass Recharge', 500, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '5 days', 'Cash'),
    (v_user_id, 'Fuel Station', 3500, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '8 days', 'Debit Card'),
    (v_user_id, 'Auto Rickshaw', 120, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '14 days', 'Cash'),
    (v_user_id, 'Cab to Airport', 1500, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '18 days', 'UPI'),
    (v_user_id, 'Metro Card Top-up', 300, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '22 days', 'Cash'),
    (v_user_id, 'Bike Service', 2200, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '25 days', 'Cash'),
    (v_user_id, 'Parking Fee', 150, 'Transport', v_now - INTERVAL '1 month' + INTERVAL '30 days', 'Cash'),
    (v_user_id, 'Uber Ride', 350, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '1 days', 'UPI'),
    (v_user_id, 'Bus Pass Recharge', 500, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '5 days', 'Cash'),
    (v_user_id, 'Fuel Station', 3700, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '10 days', 'Debit Card'),
    (v_user_id, 'Train Ticket', 780, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '13 days', 'UPI'),
    (v_user_id, 'Auto Rickshaw', 130, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '17 days', 'Cash'),
    (v_user_id, 'Cab to Airport', 1500, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '20 days', 'UPI'),
    (v_user_id, 'Car Wash', 400, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '24 days', 'Cash'),
    (v_user_id, 'Parking Fee', 150, 'Transport', v_now - INTERVAL '0 months' + INTERVAL '28 days', 'Cash');

  -- Shopping (5-6 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Amazon Order', 2450, 'Shopping', v_now - INTERVAL '2 months' + INTERVAL '5 days', 'Credit Card'),
    (v_user_id, 'Clothing Store', 5200, 'Shopping', v_now - INTERVAL '2 months' + INTERVAL '11 days', 'Credit Card'),
    (v_user_id, 'Books', 1200, 'Shopping', v_now - INTERVAL '2 months' + INTERVAL '18 days', 'Debit Card'),
    (v_user_id, 'Home Decor', 3400, 'Shopping', v_now - INTERVAL '2 months' + INTERVAL '22 days', 'UPI'),
    (v_user_id, 'Office Supplies', 890, 'Shopping', v_now - INTERVAL '2 months' + INTERVAL '29 days', 'UPI'),
    (v_user_id, 'Electronics', 12500, 'Shopping', v_now - INTERVAL '1 month' + INTERVAL '4 days', 'Credit Card'),
    (v_user_id, 'Footwear', 3800, 'Shopping', v_now - INTERVAL '1 month' + INTERVAL '9 days', 'Credit Card'),
    (v_user_id, 'Gadgets Accessories', 1850, 'Shopping', v_now - INTERVAL '1 month' + INTERVAL '16 days', 'Debit Card'),
    (v_user_id, 'Online Course', 4500, 'Shopping', v_now - INTERVAL '1 month' + INTERVAL '21 days', 'Credit Card'),
    (v_user_id, 'Furniture', 8600, 'Shopping', v_now - INTERVAL '1 month' + INTERVAL '27 days', 'Debit Card'),
    (v_user_id, 'Amazon Order', 2999, 'Shopping', v_now - INTERVAL '0 months' + INTERVAL '3 days', 'Credit Card'),
    (v_user_id, 'Clothing Store', 4800, 'Shopping', v_now - INTERVAL '0 months' + INTERVAL '8 days', 'Credit Card'),
    (v_user_id, 'Mobile Accessories', 999, 'Shopping', v_now - INTERVAL '0 months' + INTERVAL '15 days', 'UPI'),
    (v_user_id, 'Books', 1450, 'Shopping', v_now - INTERVAL '0 months' + INTERVAL '19 days', 'Debit Card'),
    (v_user_id, 'Home Decor', 2800, 'Shopping', v_now - INTERVAL '0 months' + INTERVAL '25 days', 'UPI');

  -- Bills (4 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Electricity Bill', 4200, 'Bills', v_now - INTERVAL '2 months' + INTERVAL '8 days', 'Bank Transfer'),
    (v_user_id, 'Internet Bill', 1500, 'Bills', v_now - INTERVAL '2 months' + INTERVAL '15 days', 'Debit Card'),
    (v_user_id, 'Phone Recharge', 799, 'Bills', v_now - INTERVAL '2 months' + INTERVAL '20 days', 'UPI'),
    (v_user_id, 'Netflix Subscription', 649, 'Bills', v_now - INTERVAL '2 months' + INTERVAL '25 days', 'Credit Card'),
    (v_user_id, 'Electricity Bill', 4200, 'Bills', v_now - INTERVAL '1 month' + INTERVAL '7 days', 'Bank Transfer'),
    (v_user_id, 'Internet Bill', 1500, 'Bills', v_now - INTERVAL '1 month' + INTERVAL '14 days', 'Debit Card'),
    (v_user_id, 'Gas Bill', 1800, 'Bills', v_now - INTERVAL '1 month' + INTERVAL '19 days', 'UPI'),
    (v_user_id, 'Cloud Storage', 450, 'Bills', v_now - INTERVAL '1 month' + INTERVAL '28 days', 'Debit Card'),
    (v_user_id, 'Electricity Bill', 4400, 'Bills', v_now - INTERVAL '0 months' + INTERVAL '6 days', 'Bank Transfer'),
    (v_user_id, 'Internet Bill', 1500, 'Bills', v_now - INTERVAL '0 months' + INTERVAL '13 days', 'Debit Card'),
    (v_user_id, 'Phone Recharge', 799, 'Bills', v_now - INTERVAL '0 months' + INTERVAL '18 days', 'UPI'),
    (v_user_id, 'Streaming Service', 299, 'Bills', v_now - INTERVAL '0 months' + INTERVAL '27 days', 'Credit Card');

  -- Health (3 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Pharmacy', 650, 'Health', v_now - INTERVAL '2 months' + INTERVAL '8 days', 'Cash'),
    (v_user_id, 'Gym Membership', 2500, 'Health', v_now - INTERVAL '2 months' + INTERVAL '15 days', 'Debit Card'),
    (v_user_id, 'Health Checkup', 5000, 'Health', v_now - INTERVAL '2 months' + INTERVAL '22 days', 'UPI'),
    (v_user_id, 'Doctor Visit', 2000, 'Health', v_now - INTERVAL '1 month' + INTERVAL '6 days', 'Cash'),
    (v_user_id, 'Vitamins & Supplements', 1200, 'Health', v_now - INTERVAL '1 month' + INTERVAL '18 days', 'UPI'),
    (v_user_id, 'Dental Checkup', 1500, 'Health', v_now - INTERVAL '1 month' + INTERVAL '25 days', 'Cash'),
    (v_user_id, 'Pharmacy', 780, 'Health', v_now - INTERVAL '0 months' + INTERVAL '7 days', 'Cash'),
    (v_user_id, 'Gym Membership', 2500, 'Health', v_now - INTERVAL '0 months' + INTERVAL '15 days', 'Debit Card'),
    (v_user_id, 'Health Checkup', 3500, 'Health', v_now - INTERVAL '0 months' + INTERVAL '22 days', 'UPI');

  -- Entertainment (4 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Movie Tickets', 1200, 'Entertainment', v_now - INTERVAL '2 months' + INTERVAL '5 days', 'UPI'),
    (v_user_id, 'Bowling', 800, 'Entertainment', v_now - INTERVAL '2 months' + INTERVAL '14 days', 'Cash'),
    (v_user_id, 'Gaming Subscription', 499, 'Entertainment', v_now - INTERVAL '2 months' + INTERVAL '20 days', 'Credit Card'),
    (v_user_id, 'Amusement Park', 3200, 'Entertainment', v_now - INTERVAL '2 months' + INTERVAL '28 days', 'UPI'),
    (v_user_id, 'Concert Tickets', 5000, 'Entertainment', v_now - INTERVAL '1 month' + INTERVAL '8 days', 'Credit Card'),
    (v_user_id, 'Movie Tickets', 1200, 'Entertainment', v_now - INTERVAL '1 month' + INTERVAL '15 days', 'UPI'),
    (v_user_id, 'Mini Golf', 600, 'Entertainment', v_now - INTERVAL '1 month' + INTERVAL '22 days', 'Cash'),
    (v_user_id, 'Gaming Subscription', 499, 'Entertainment', v_now - INTERVAL '1 month' + INTERVAL '29 days', 'Credit Card'),
    (v_user_id, 'Movie Tickets', 1500, 'Entertainment', v_now - INTERVAL '0 months' + INTERVAL '4 days', 'UPI'),
    (v_user_id, 'Bowling', 800, 'Entertainment', v_now - INTERVAL '0 months' + INTERVAL '12 days', 'Cash'),
    (v_user_id, 'Amusement Park', 3200, 'Entertainment', v_now - INTERVAL '0 months' + INTERVAL '20 days', 'UPI'),
    (v_user_id, 'Concert Tickets', 3500, 'Entertainment', v_now - INTERVAL '0 months' + INTERVAL '28 days', 'Credit Card');

  -- Other (2 per month)
  INSERT INTO public.expenses (user_id, title, amount, category, date, payment_method) VALUES
    (v_user_id, 'Gift', 2000, 'Other', v_now - INTERVAL '2 months' + INTERVAL '9 days', 'UPI'),
    (v_user_id, 'Donation', 1000, 'Other', v_now - INTERVAL '2 months' + INTERVAL '23 days', 'UPI'),
    (v_user_id, 'Laundry Service', 300, 'Other', v_now - INTERVAL '1 month' + INTERVAL '10 days', 'Cash'),
    (v_user_id, 'Charity', 500, 'Other', v_now - INTERVAL '1 month' + INTERVAL '24 days', 'UPI'),
    (v_user_id, 'ATM Fee', 25, 'Other', v_now - INTERVAL '0 months' + INTERVAL '11 days', 'Cash'),
    (v_user_id, 'Gift', 2500, 'Other', v_now - INTERVAL '0 months' + INTERVAL '25 days', 'UPI');

  GET DIAGNOSTICS v_count_expenses = ROW_COUNT;
  -- Count all expenses (not just last batch)
  SELECT COUNT(*) INTO v_count_expenses FROM public.expenses WHERE user_id = v_user_id;

  -- ─── SUMMARY ──────────────────────────────────────────────
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '        ✅ SEED COMPLETE!';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  📧 Email:     %', v_email;
  RAISE NOTICE '  🔑 Password:  %', v_password;
  RAISE NOTICE '  💰 Expenses:  %', v_count_expenses;
  RAISE NOTICE '  💵 Income:    %', v_count_incomes;
  RAISE NOTICE '  📊 Budgets:   %', v_count_budgets;
  RAISE NOTICE '  🔄 Recurring: %', v_count_recurring;
  RAISE NOTICE '══════════════════════════════════════════';
END $$;