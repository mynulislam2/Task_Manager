export const getCategoryStyle = (name: string) => {
  const lower = name.toLowerCase();
  let icon = 'folder-outline';
  if (lower.includes('work') || lower.includes('job') || lower.includes('office')) icon = 'briefcase-outline';
  else if (lower.includes('personal') || lower.includes('life')) icon = 'account-outline';
  else if (lower.includes('errand') || lower.includes('shop') || lower.includes('buy') || lower.includes('grocer')) icon = 'cart-outline';
  else if (lower.includes('home') || lower.includes('house')) icon = 'home-outline';
  else if (lower.includes('study') || lower.includes('school') || lower.includes('learn')) icon = 'school-outline';
  else if (lower.includes('health') || lower.includes('fit') || lower.includes('gym') || lower.includes('doctor') || lower.includes('med')) icon = 'heart-outline';
  else if (lower.includes('finance') || lower.includes('money') || lower.includes('pay') || lower.includes('bill')) icon = 'cash';
  else if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation')) icon = 'airplane';
  else if (lower.includes('idea') || lower.includes('brain') || lower.includes('think')) icon = 'lightbulb-outline';
  else if (lower.includes('code') || lower.includes('dev') || lower.includes('tech')) icon = 'code-tags';
  else if (lower.includes('food') || lower.includes('eat') || lower.includes('cook')) icon = 'food-variant';
  else {
    const fallbacks = ['folder-outline', 'bookmark-outline', 'tag-outline', 'label-outline', 'layers-outline', 'shape-outline'];
    let iconHash = 0;
    for (let i = 0; i < name.length; i++) iconHash = name.charCodeAt(i) + ((iconHash << 5) - iconHash);
    icon = fallbacks[Math.abs(iconHash) % fallbacks.length];
  }

  const colors = [
    { bg: '#E0E7FF', text: '#4F46E5' }, // Indigo
    { bg: '#D1FAE5', text: '#059669' }, // Emerald
    { bg: '#FEF3C7', text: '#D97706' }, // Amber
    { bg: '#FEE2E2', text: '#DC2626' }, // Red
    { bg: '#F3E8FF', text: '#7C3AED' }, // Violet
    { bg: '#FCE7F3', text: '#DB2777' }, // Pink
    { bg: '#CFFAFE', text: '#0891B2' }, // Cyan
    { bg: '#FFEDD5', text: '#EA580C' }, // Orange
  ];
  let colorHash = 0;
  for (let i = 0; i < name.length; i++) colorHash = name.charCodeAt(i) + ((colorHash << 5) - colorHash);
  
  return { icon, colors: colors[Math.abs(colorHash) % colors.length] };
};
