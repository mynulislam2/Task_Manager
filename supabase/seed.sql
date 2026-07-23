-- Task Manager — Seed Data
-- Run in Supabase SQL Editor after applying the migration.

INSERT INTO public.categories (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Work'),
('22222222-2222-2222-2222-222222222222', 'Personal'),
('33333333-3333-3333-3333-333333333333', 'Errands')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (title, description, status, due_date, category_id) VALUES 
('Finish quarterly report', 'Q3 financial summary for the board', 'open', '2026-08-15T10:00:00Z', '11111111-1111-1111-1111-111111111111'),
('Buy groceries', 'Milk, eggs, bread, vegetables', 'done', '2026-07-22T10:00:00Z', '33333333-3333-3333-3333-333333333333'),
('Call mom', 'Weekly catch-up call', 'open', NULL, '22222222-2222-2222-2222-222222222222'),
('Pay electricity bill', 'Due by end of month', 'open', '2026-07-31T10:00:00Z', '33333333-3333-3333-3333-333333333333'),
('Read new tech blog', 'Blog post on React Native performance', 'done', NULL, '22222222-2222-2222-2222-222222222222'),
('Update resume', 'Add latest project experience', 'open', '2026-08-10T10:00:00Z', '11111111-1111-1111-1111-111111111111'),
('Schedule dentist appointment', 'Annual checkup', 'open', '2026-08-05T10:00:00Z', '22222222-2222-2222-2222-222222222222'),
('Drop off dry cleaning', 'Winter coats', 'done', '2026-07-20T10:00:00Z', '33333333-3333-3333-3333-333333333333');
