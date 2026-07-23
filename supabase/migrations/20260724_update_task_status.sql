-- Clean up old unused finance tables
DROP TABLE IF EXISTS public.recurring_payments CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.incomes CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'in_review', 'reopen', 'done')),
  due_date timestamp with time zone,
  category_id uuid REFERENCES public.categories(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Ensure the constraint is updated in case the table already existed
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('open', 'in_progress', 'in_review', 'reopen', 'done'));

-- Seed default categories
INSERT INTO public.categories (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Work'),
('22222222-2222-2222-2222-222222222222', 'Personal'),
('33333333-3333-3333-3333-333333333333', 'Errands')
ON CONFLICT (id) DO NOTHING;
