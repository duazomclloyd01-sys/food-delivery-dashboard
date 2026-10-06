export const user = { name: 'Juan Dela Cruz', address: '45 Mabini St., Quezon City', balance: 5285.87, card: '5812', expiry: '08/24' };

export const dishes = [
  { id: 'd1', name: 'Chicken Adobo Meal', short: 'Chicken Adobo', price: 179, rating: 4.8, time: '20–25 mins', ship: 'Free ship', tags: ['RICE MEALS', 'ULAM'], emoji: '🍛', tint: '#FFE8D6', calories: 620, desc: 'Classic soy-vinegar adobo with garlic rice and a side of atchara.' },
  { id: 'd2', name: 'Crispy Sisig', short: 'Crispy Sisig', price: 229, rating: 4.8, time: '15–20 mins', ship: 'Free ship', tags: ['SIZZLING', 'PORK'], emoji: '🍳', tint: '#FFF0D9', calories: 580, desc: 'Sizzling chopped pork with calamansi, chili and a runny egg on top.' },
  { id: 'd3', name: 'Pancit Palabok', short: 'Pancit Palabok', price: 179, rating: 4.8, time: '20–25 mins', ship: 'Free ship', tags: ['NOODLES'], emoji: '🍝', tint: '#FFF3D6', calories: 540, desc: 'Rice noodles in rich shrimp sauce with chicharon, egg and tinapa flakes.' },
  { id: 'd4', name: 'Beef Kare-Kare', short: 'Beef Kare-Kare', price: 349, rating: 4.7, time: '30–35 mins', ship: 'Free ship', tags: ['RICE MEALS', 'BEEF'], emoji: '🥘', tint: '#FFE9D6', calories: 720, desc: 'Slow-simmered beef in peanut sauce with sitaw, pechay and bagoong.' },
  { id: 'd5', name: 'Sinigang na Baboy', short: 'Sinigang Baboy', price: 249, rating: 4.8, time: '25–30 mins', ship: 'Free ship', tags: ['RICE MEALS', 'SOUP'], emoji: '🍲', tint: '#FFEBE0', calories: 480, desc: 'Sour tamarind soup with tender pork, kangkong, labanos and gabi.' },
  { id: 'd6', name: 'Chicken Inasal', short: 'Chicken Inasal', price: 199, rating: 4.7, time: '20–25 mins', ship: 'Free ship', tags: ['GRILL', 'CHICKEN'], emoji: '🍗', tint: '#FFE4D1', calories: 650, desc: 'Bacolod-style grilled chicken in calamansi-annatto oil with garlic rice.' },
  { id: 'd7', name: 'Halo-Halo Special', short: 'Halo-Halo', price: 149, rating: 4.9, time: '10–15 mins', ship: 'Free ship', tags: ['DESSERTS', 'MERIENDA'], emoji: '🍨', tint: '#F3E8FF', calories: 420, desc: 'Top of the week — shaved ice, leche flan, ube halaya and pinipig crunch.' },
  { id: 'd8', name: 'Crispy Pata', short: 'Crispy Pata', price: 599, rating: 4.8, time: '35–40 mins', ship: 'Free ship', tags: ['GRILL', 'SHARING'], emoji: '🍖', tint: '#F5E8E0', calories: 980, desc: 'Twice-cooked crispy pork leg with spiced vinegar — good for sharing.' },
  { id: 'd9', name: 'Buko Juice', short: 'Buko Juice', price: 99, rating: 4.6, time: '5–10 mins', ship: 'Free ship', tags: ['DRINKS'], emoji: '🥥', tint: '#E6F7E9', calories: 120, desc: 'Fresh buko juice with tender coconut meat, served ice-cold.' },
  { id: 'd10', name: 'Lechon Kawali', short: 'Lechon Kawali', price: 279, rating: 4.9, time: '25–30 mins', ship: 'Free ship', tags: ['RICE MEALS', 'PORK'], emoji: '🥓', tint: '#FFEBE0', calories: 760, desc: 'Golden deep-fried pork belly with Mang Tomas-style liver sauce.' },
  { id: 'd11', name: 'Leche Flan', short: 'Leche Flan', price: 129, rating: 4.6, time: '10–15 mins', ship: 'Free ship', tags: ['DESSERTS'], emoji: '🍮', tint: '#FFF3D6', calories: 380, desc: 'Silky caramel custard made with egg yolks and condensed milk.' },
  { id: 'd12', name: 'lumpiang Shanghai', short: 'lumpiang Shanghai', price: 159, rating: 4.7, time: '15–20 mins', ship: 'Free ship', tags: ['MERIENDA'], emoji: '🌯', tint: '#FFF0D9', calories: 450, desc: '12 pieces of crispy pork spring rolls with sweet chili dip.' },
];

export const trendingIds = ['d7', 'd2', 'd6'];
export const basedOnIds = ['d1', 'd2', 'd3', 'd6'];
export const categories = ['All', 'Rice Meals', 'Sizzling', 'Noodles', 'Grill', 'Desserts', 'Drinks', 'Merienda'];

export const promos = [
  { code: 'PINOY20', title: '20% off your order', desc: 'Min. order ₱500 • first checkout', pct: 20 },
  { code: 'FREEDEL', title: 'Free delivery weekend', desc: 'Zero service fee Sat–Sun', pct: 0 },
  { code: 'LUNCH15', title: '15% off lunch 11am–2pm', desc: 'Weekdays only', pct: 15 },
];

export const notifications = [
  { id: 'n1', title: 'Order on the way 🛵', body: '#ORD-8421 is 6 min away — Kuya Marco picked it up.', time: '2m' },
  { id: 'n2', title: 'Weekend handaan deal', body: 'Free delivery all weekend with code FREEDEL.', time: '1h' },
  { id: 'n3', title: '20% off with PINOY20', body: 'Use PINOY20 at checkout before Sunday.', time: '3h' },
];
