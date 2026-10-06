# Pinoy Food Ordering App — Landscape (Expo + React Native)

A Philippines-localized food ordering application built with **Expo + React Native**, designed from the Figma Make prototype.

## Design

- Primary color: `#F26B1D`
- Gradient: `#FF8A3D → #E8541A`
- Background: `#F4F5F7`
- White cards
- Main text: `#1F1F1F`
- Muted gray secondary text
- Poppins typography
- 12–20px corner radius
- Soft shadows
- Generous whitespace
- Landscape-first layout
- Slim icon rail
- Multi-column dashboard

## Run the App

```powershell
npm install
npx expo start
```

Press `w` to run on web, or scan the QR code using **Expo Go** on a physical device.

For the best experience, use landscape orientation.

## Main Home Screen

The Home screen includes:

- Slim icon rail with logo, Home, Bag, Favorites, Orders, Rewards, Schedule, Settings, and Logout
- Cart badge
- Top search bar: "Search ulam, merienda…"
- User profile
- Notification bell and messages
- Weekend promotional hero section
- Free delivery promotion
- Food recommendation cards
- Trending Orders
- Balance card
- Delivery address
- Order Menu
- Quantity steppers
- Service fee
- Total amount
- Coupon input
- Checkout button

## Pinoy Menu

The application includes 12 Filipino dishes:

1. Adobo
2. Crispy Sisig
3. Palabok
4. Kare-Kare
5. Sinigang
6. Chicken Inasal
7. Halo-Halo
8. Crispy Pata
9. Buko Juice
10. Lechon Kawali
11. Leche Flan
12. Lumpiang Shanghai

Categories include:

- Rice Meals
- Sizzling
- Noodles
- Grill
- Desserts
- Drinks
- Merienda

Prices range from `₱99` to `₱599`.

## Additional Screens

The application includes:

### Browse
- Full menu
- Live search
- Category filters
- Dish detail modal

### Favorites
- Saved dishes grid

### My Orders
- Live rider tracking
- Order history
- Reorder function

### Rewards
- Loyalty points
- `PINOY20`
- `LUNCH15`
- `FREEDEL`

### Schedule
- Weekly schedule
- Scheduled meals
- Cancel option

### Settings
- Profile
- Quezon City addresses
- GCash payments
- Notifications
- Help

### Checkout
- Order items
- Coupon application
- GCash
- Card
- Cash
- Wallet
- Checkout success state

### Notifications
- Order updates
- Promotions and deals

## SQLite Inventory

The application also includes **offline-first SQLite persistence** using `expo-sqlite`.

Database:

```text
pos_inventory.db
```

Table:

```text
products
```

Columns:

```text
id
name
category
price
stock
```

The SQLite inventory supports:

- Automatic database initialization
- Automatic sample-data seeding
- Reading products from SQLite
- Parameterized product search
- Add Product
- Delete Product
- Local data persistence
- Offline operation

Search uses SQLite `LIKE` filtering, and product changes are stored directly in the local database.

## Project Structure

```text
food-delivery-dashboard/
├── assets/
├── src/
│   ├── components/
│   ├── data/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── Screens.js
│   │   └── StatisticsScreen.js
│   ├── services/
│   │   └── db.js
│   ├── store.js
│   └── theme.js
├── App.js
├── app.json
├── package.json
└── README.md
```

## State and Data

Application state is managed in:

```text
src/store.js
```

Mock data is stored in:

```text
src/data/mock.js
```

SQLite database logic is located in:

```text
src/services/db.js
```

## Technologies

- React Native
- Expo
- Expo Go
- Expo SQLite
- JavaScript
- Figma Make