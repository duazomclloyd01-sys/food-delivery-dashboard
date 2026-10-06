# Pinoy Food Ordering App — Landscape (Expo + React Native)

Localized for the Philippines, styled to the Figma Make prototype:
- Primary `#F26B1D`, gradient `#FF8A3D → #E8541A`
- Bg `#F4F5F7`, white cards, text `#1F1F1F`, muted gray secondary
- Poppins (renders ₱), 12–20px radius, soft shadows, generous whitespace
- **Landscape-first**: locked to `LANDSCAPE`, slim icon rail, multi-column layout

## Run
```powershell
npm install
npx expo start
# press w for web, or scan QR with Expo Go (use landscape / tablet)
```

## Prototype screen (Home)
- Slim icon rail: logo, home / bag / favorites / orders / rewards / schedule, settings, logout + cart badge
- Top bar: search ("Search ulam, merienda…"), Juan Dela Cruz profile, notification bell, messages
- Hero: "DEAL OF THE WEEKEND / Tikman ang lutong Pinoy", FREE delivery burst, Check Menu
- "Based On The Type Of Food You Like" (View All 12): cards with rating, Free ship, price, tags, hearts
- "Trending Orders": TOP OF THE WEEK Halo-Halo / Sisig / Inasal cards
- Right panel: orange Balance card (₱5,285.87, •••• 5812, 08/24), Address (45 Mabini St., Quezon City + Change), Order Menu with steppers, Service ₱49, Total, coupon box, orange Checkout

## Pinoy menu (12 dishes, ₱99–₱599)
Adobo, Crispy Sisig, Palabok, Kare-Kare, Sinigang, Chicken Inasal, Halo-Halo, Crispy Pata, Buko Juice, Lechon Kawali, Leche Flan, lumpiang Shanghai — categories: Rice Meals, Sizzling, Noodles, Grill, Desserts, Drinks, Merienda.

## Missing pages created
- **Browse** — full menu, live search, category chips, dish detail modal
- **Favorites** — saved dishes grid
- **My Orders** — live rider tracking (Kuya Marco) + history with Reorder
- **Rewards** — loyalty points + PINOY20 / LUNCH15 / FREEDEL codes (apply at checkout)
- **Schedule** — week strip + scheduled meals with cancel
- **Settings** — profile, QC addresses, GCash payments, notifications, help
- **Checkout modal** — items, coupon (try PINOY20), GCash / card / cash / wallet, success state
- **Notifications modal** — order updates + deals

State lives in `src/store.js` (cart, favorites, coupon, history, schedule). Mock data in `src/data/mock.js`.
