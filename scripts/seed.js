const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdokmkvtndiviaxgqrqj.supabase.co';
const supabaseKey = 'sb_publishable_JpofJYsmP-uM6_4lD2Lhrw_dmU-oFf_';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: require('ws') },
  auth: { persistSession: false }
});

async function seed() {
  console.log('Seeding tasks...');
  
  let { data: categories } = await supabase.from('categories').select('*');
  
  if (!categories || categories.length === 0) {
    console.log('Creating default categories...');
    const { data: newCats } = await supabase.from('categories').insert([
      { name: 'Work' },
      { name: 'Home' },
      { name: 'Finance' },
      { name: 'Health' },
    ]).select();
    categories = newCats;
  }
  
  let workCatId = null;
  let homeCatId = null;
  let financeCatId = null;

  if (categories && categories.length > 0) {
    workCatId = categories.find(c => c.name.toLowerCase() === 'work')?.id || categories[0].id;
    homeCatId = categories.find(c => c.name.toLowerCase() === 'home')?.id || categories[0].id;
    financeCatId = categories.find(c => c.name.toLowerCase() === 'finance')?.id || categories[0].id;
  }

  const tasks = [
    {
      title: 'Finish Quarterly Financial Report',
      description: 'Compile all Q3 expenses and revenue. Prepare the presentation for the board meeting next week.',
      status: 'in_progress',
      category_id: financeCatId,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Buy groceries for the week',
      description: 'Milk, Eggs, Bread, Chicken breasts, Vegetables (broccoli, carrots), Coffee beans.',
      status: 'open',
      category_id: homeCatId,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Update project dependencies',
      description: 'React Native needs to be updated. Check for breaking changes in navigation.',
      status: 'done',
      category_id: workCatId,
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Book flights for vacation',
      description: 'Look for flights to Japan for early November. Check ANA and JAL.',
      status: 'open',
      category_id: null,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Prepare design assets for v2',
      description: 'Need new icons for the task form and better illustrations for the empty states.',
      status: 'in_review',
      category_id: workCatId,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const { data, error } = await supabase.from('tasks').insert(tasks).select();
  
  if (error) {
    console.error('Error seeding tasks:', error);
  } else {
    console.log(`Successfully seeded ${data.length} tasks!`);
  }
}

seed();
