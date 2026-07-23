/**
 * Seed Data Generator for FinTrack
 *
 * Creates realistic sample data: expenses, income, budgets, recurring payments
 *
 * Usage: node scripts/seed-data.mjs
 *
 * Prerequisites:
 * - .env file with SUPABASE_URL and SUPABASE_ANON_KEY
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)?.[1]?.trim();
const SUPABASE_ANON_KEY = envContent.match(/SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const TEST_EMAIL = 'mynulislamridoy@gmail.com';
const TEST_PASSWORD = '1232Mynul@';
const TEST_NAME = 'Mynul Islam';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Bank Transfer'];
const FREQUENCIES = ['weekly', 'monthly', 'yearly'];

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────

async function api(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  try {
    return { data: JSON.parse(text), error: !res.ok ? text : null };
  } catch {
    return { data: text, error: !res.ok ? text : null };
  }
}

async function signUp() {
  const { data, error } = await api('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      data: { name: TEST_NAME },
    }),
  });

  if (error) {
    // Might already exist - try signing in
    const { data: si, error: siErr } = await api('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    if (siErr) {
      console.error('   ❌ Auth error:', siErr);
      console.error('\n   💡 Tip: Create the user manually in Supabase dashboard:');
      console.error('      Authentication > Add User > Email: ' + TEST_EMAIL);
      console.error('      Password: ' + TEST_PASSWORD);
      console.error('      Or enable email sign-ups: Authentication > Providers > Email\n');
      process.exit(1);
    }

    return si;
  }

  return data;
}

async function signIn() {
  const { data, error } = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });

  if (error) {
    console.error('   ❌ Sign-in failed:', error);
    process.exit(1);
  }

  return data;
}

// ─── FETCH WRAPPER WITH AUTH ────────────────────────────────────────────────

function authedApi(token, path, options = {}) {
  return api(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'return=representation',
      ...options.headers,
    },
  });
}

// ─── DATA GENERATORS ────────────────────────────────────────────────────────

function generateExpenses(userId) {
  const expenses = [];
  const now = new Date();

  const foodItems = [
    { title: 'Lunch at Café', amount: 450 },
    { title: 'Grocery Store', amount: 2850 },
    { title: 'Pizza Delivery', amount: 890 },
    { title: 'Coffee & Snacks', amount: 320 },
    { title: 'Dinner at Restaurant', amount: 2100 },
    { title: 'Bakery', amount: 450 },
    { title: 'Sushi Takeout', amount: 1200 },
    { title: 'Weekly Groceries', amount: 3200 },
    { title: 'Breakfast Cafe', amount: 380 },
    { title: 'BBQ Night', amount: 1800 },
    { title: 'Supermarket', amount: 4100 },
    { title: 'Lunch Meeting', amount: 650 },
    { title: 'Ice Cream', amount: 180 },
    { title: 'Thai Food', amount: 950 },
    { title: 'Farmers Market', amount: 1200 },
  ];

  const transportItems = [
    { title: 'Uber Ride', amount: 350 },
    { title: 'Bus Pass Recharge', amount: 500 },
    { title: 'Fuel Station', amount: 3500 },
    { title: 'Auto Rickshaw', amount: 120 },
    { title: 'Train Ticket', amount: 780 },
    { title: 'Cab to Airport', amount: 1500 },
    { title: 'Metro Card Top-up', amount: 300 },
    { title: 'Bike Service', amount: 2200 },
    { title: 'Parking Fee', amount: 150 },
    { title: 'Car Wash', amount: 400 },
  ];

  const shoppingItems = [
    { title: 'Amazon Order', amount: 2450 },
    { title: 'Clothing Store', amount: 5200 },
    { title: 'Electronics', amount: 12500 },
    { title: 'Books', amount: 1200 },
    { title: 'Home Decor', amount: 3400 },
    { title: 'Footwear', amount: 3800 },
    { title: 'Gadgets Accessories', amount: 1850 },
    { title: 'Online Course', amount: 4500 },
    { title: 'Office Supplies', amount: 890 },
    { title: 'Furniture', amount: 8600 },
    { title: 'Mobile Accessories', amount: 999 },
  ];

  const billsItems = [
    { title: 'Electricity Bill', amount: 4200 },
    { title: 'Internet Bill', amount: 1500 },
    { title: 'Phone Recharge', amount: 799 },
    { title: 'Gas Bill', amount: 1800 },
    { title: 'Water Bill', amount: 650 },
    { title: 'Netflix Subscription', amount: 649 },
    { title: 'Streaming Service', amount: 299 },
    { title: 'Cloud Storage', amount: 450 },
    { title: 'Insurance Premium', amount: 8500 },
  ];

  const healthItems = [
    { title: 'Pharmacy', amount: 650 },
    { title: 'Doctor Visit', amount: 2000 },
    { title: 'Gym Membership', amount: 2500 },
    { title: 'Health Checkup', amount: 5000 },
    { title: 'Vitamins & Supplements', amount: 1200 },
    { title: 'Dental Checkup', amount: 1500 },
  ];

  const entertainmentItems = [
    { title: 'Movie Tickets', amount: 1200 },
    { title: 'Concert Tickets', amount: 5000 },
    { title: 'Gaming Subscription', amount: 499 },
    { title: 'Bowling', amount: 800 },
    { title: 'Amusement Park', amount: 3200 },
    { title: 'Mini Golf', amount: 600 },
  ];

  const otherItems = [
    { title: 'Gift', amount: 2000 },
    { title: 'Donation', amount: 1000 },
    { title: 'Laundry Service', amount: 300 },
    { title: 'ATM Fee', amount: 25 },
    { title: 'Charity', amount: 500 },
  ];

  const categoryMap = {
    Food: foodItems,
    Transport: transportItems,
    Shopping: shoppingItems,
    Bills: billsItems,
    Health: healthItems,
    Entertainment: entertainmentItems,
    Other: otherItems,
  };

  // Generate 3 months of data
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0).getDate();

    for (const [category, items] of Object.entries(categoryMap)) {
      const count = { Food: 12, Transport: 8, Shopping: 5, Bills: 4, Health: 3, Entertainment: 4, Other: 2 }[category] || 3;

      for (let i = 0; i < count; i++) {
        const item = items[(monthOffset * 3 + i) % items.length];
        const day = 1 + Math.floor((i * daysInMonth) / count);
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, day);
        const method = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];

        expenses.push({
          user_id: userId,
          title: item.title,
          amount: item.amount,
          category,
          date: date.toISOString().split('T')[0],
          payment_method: method,
        });
      }
    }
  }

  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  return expenses;
}

function generateIncomes(userId) {
  const incomes = [];
  const now = new Date();

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 28);
    incomes.push({
      user_id: userId,
      source: 'Salary',
      amount: 85000,
      date: date.toISOString().split('T')[0],
      notes: 'Monthly salary - Tech Corp',
    });
  }

  const freelanceJobs = [
    { title: 'Freelance Project - Web App', amount: 25000 },
    { title: 'Freelance - UI Design', amount: 12000 },
    { title: 'Consultation Fee', amount: 8000 },
    { title: 'Freelance - API Integration', amount: 18000 },
    { title: 'Freelance - Mobile App', amount: 35000 },
    { title: 'Technical Writing', amount: 5000 },
    { title: 'Freelance - Code Review', amount: 6000 },
  ];

  for (let i = 0; i < freelanceJobs.length; i++) {
    const monthOffset = Math.floor(i / 2.5);
    const day = 5 + (i * 7) % 20;
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, day);
    incomes.push({
      user_id: userId,
      source: 'Freelance',
      amount: freelanceJobs[i].amount,
      date: date.toISOString().split('T')[0],
      notes: freelanceJobs[i].title,
    });
  }

  const investments = [
    { amount: 3200, date: new Date(now.getFullYear(), now.getMonth() - 2, 15) },
    { amount: 2800, date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
    { amount: 4100, date: new Date(now.getFullYear(), now.getMonth(), 15) },
  ];

  for (const inv of investments) {
    incomes.push({
      user_id: userId,
      source: 'Investment',
      amount: inv.amount,
      date: inv.date.toISOString().split('T')[0],
      notes: 'Dividend & stock returns',
    });
  }

  incomes.sort((a, b) => new Date(b.date) - new Date(a.date));
  return incomes;
}

function generateBudgets(userId) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return [
    { category: 'Food', limit_amount: 15000, month: currentMonth },
    { category: 'Transport', limit_amount: 8000, month: currentMonth },
    { category: 'Shopping', limit_amount: 20000, month: currentMonth },
    { category: 'Bills', limit_amount: 18000, month: currentMonth },
    { category: 'Health', limit_amount: 10000, month: currentMonth },
    { category: 'Entertainment', limit_amount: 8000, month: currentMonth },
    { category: 'Other', limit_amount: 5000, month: currentMonth },
  ];
}

function generateRecurringPayments(userId) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  function getNextDay(dayOfMonth) {
    let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
    }
    return next.toISOString().split('T')[0];
  }

  return [
    { name: 'Netflix Standard', amount: 649, category: 'Entertainment', frequency: 'monthly', start_date: '2025-01-15', next_date: getNextDay(15) },
    { name: 'Apartment Rent', amount: 25000, category: 'Bills', frequency: 'monthly', start_date: '2024-06-01', next_date: getNextDay(1) },
    { name: 'Internet Fiber', amount: 1500, category: 'Bills', frequency: 'monthly', start_date: '2024-06-01', next_date: getNextDay(5) },
    { name: 'Gym Membership', amount: 2500, category: 'Health', frequency: 'monthly', start_date: '2025-03-01', next_date: getNextDay(10) },
    { name: 'Cloud Storage (Google)', amount: 450, category: 'Bills', frequency: 'monthly', start_date: '2025-01-01', next_date: getNextDay(12) },
    { name: 'Spotify Premium', amount: 299, category: 'Entertainment', frequency: 'monthly', start_date: '2025-02-01', next_date: getNextDay(20) },
    { name: 'Car Insurance', amount: 18000, category: 'Transport', frequency: 'yearly', start_date: '2025-08-01', next_date: '2026-08-01' },
    { name: 'Domain & Hosting', amount: 3500, category: 'Bills', frequency: 'yearly', start_date: '2025-11-01', next_date: '2026-11-01' },
  ].map(r => ({ ...r, user_id: userId, is_paused: false }));
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 FinTrack — Seed Data Generator\n');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Email: ${TEST_EMAIL}\n`);

  // Step 1: Authenticate
  console.log('📝 Step 1: Signing in...');
  const auth = await signIn();
  const token = auth.access_token;
  const userId = auth.user.id;
  console.log(`   ✅ Logged in as: ${auth.user.email}`);
  console.log(`   User ID: ${userId}\n`);

  // Step 2: Create/update profile
  console.log('👤 Step 2: Setting up profile...');
  const { error: profileErr } = await authedApi(token, `/rest/v1/profiles`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: userId,
      name: TEST_NAME,
      email: TEST_EMAIL,
      currency: 'USD',
    }),
  });

  if (profileErr) {
    // Try upsert via PATCH
    const { error: patchErr } = await authedApi(token, `/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        currency: 'USD',
      }),
    });
    if (patchErr) {
      console.error('   ❌ Profile error:', patchErr);
      process.exit(1);
    }
  }
  console.log('   ✅ Profile ready\n');

  // Step 3: Delete old seed data
  console.log('🧹 Step 3: Cleaning old seed data...');
  await authedApi(token, `/rest/v1/expenses?user_id=eq.${userId}`, { method: 'DELETE' });
  await authedApi(token, `/rest/v1/incomes?user_id=eq.${userId}`, { method: 'DELETE' });
  await authedApi(token, `/rest/v1/budgets?user_id=eq.${userId}`, { method: 'DELETE' });
  await authedApi(token, `/rest/v1/recurring_payments?user_id=eq.${userId}`, { method: 'DELETE' });
  console.log('   ✅ Old data cleaned\n');

  // Step 4: Insert budgets
  console.log('💰 Step 4: Creating budgets...');
  const budgets = generateBudgets(userId);
  const bRes = await authedApi(token, '/rest/v1/budgets', {
    method: 'POST',
    body: JSON.stringify(budgets),
  });
  console.log(`   ✅ ${budgets.length} budgets created\n`);

  // Step 5: Insert recurring payments
  console.log('🔄 Step 5: Creating recurring payments...');
  const recurringList = generateRecurringPayments(userId);
  const rRes = await authedApi(token, '/rest/v1/recurring_payments', {
    method: 'POST',
    body: JSON.stringify(recurringList),
  });
  console.log(`   ✅ ${recurringList.length} recurring payments created\n`);

  // Step 6: Insert incomes
  console.log('💵 Step 6: Creating income entries...');
  const incomes = generateIncomes(userId);
  for (let i = 0; i < incomes.length; i += 20) {
    const batch = incomes.slice(i, i + 20);
    await authedApi(token, '/rest/v1/incomes', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  }
  console.log(`   ✅ ${incomes.length} income entries created\n`);

  // Step 7: Insert expenses
  console.log('💳 Step 7: Creating expense entries...');
  const expenses = generateExpenses(userId);
  for (let i = 0; i < expenses.length; i += 20) {
    const batch = expenses.slice(i, i + 20);
    await authedApi(token, '/rest/v1/expenses', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  }
  console.log(`   ✅ ${expenses.length} expense entries created\n`);

  // Summary
  console.log('══════════════════════════════════════════');
  console.log('        ✅ SEED COMPLETE!');
  console.log('══════════════════════════════════════════');
  console.log(`  📧 Email:     ${TEST_EMAIL}`);
  console.log(`  🔑 Password:  ${TEST_PASSWORD}`);
  console.log(`  💰 Expenses:  ${expenses.length}`);
  console.log(`  💵 Income:    ${incomes.length}`);
  console.log(`  📊 Budgets:   ${budgets.length}`);
  console.log(`  🔄 Recurring: ${recurringList.length}`);
  console.log('══════════════════════════════════════════');
  console.log('\nOpen the app and log in with these credentials!\n');
}

seed().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});