# 🌿 Smart Meal Planner — PWA

A fully-featured Progressive Web App for meal planning, recipe management, grocery lists, pantry tracking, and nutrition.  
**Install it on your phone like a native app — no App Store needed.**

---

## ✨ Features

- **Weekly Planner** — Schedule meals by day and type (Breakfast / Lunch / Dinner / Snack)
- **Recipe Library** — Create, search, and filter recipes with full ingredient and step details
- **AI Suggestions** — Generate recipes via Claude AI based on your preferences and pantry
- **Grocery List** — Auto-generated from your meal plan, minus what's already in your pantry
- **Pantry Tracker** — Track ingredients you have so the grocery list stays accurate
- **Nutrition Dashboard** — Weekly calorie and macro breakdown with charts
- **Offline Support** — Works without internet after first load
- **Dark Mode** — Automatically adapts to your system preference
- **Persistent Storage** — Everything saves to your device via localStorage

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Build for production

```bash
npm run build
```

---

## 📱 Installing on Your Phone

The app must be served over **HTTPS** to install as a PWA. Here are two easy ways:

### Option A — Deploy to Netlify (free, 2 minutes)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → drag the `dist/` folder onto the deploy area
3. Open the generated URL on your phone
4. **iOS Safari**: tap the Share button → "Add to Home Screen"
5. **Android Chrome**: tap the browser menu → "Add to Home Screen" (or accept the install prompt)

### Option B — Deploy to Vercel (free, 2 minutes)

```bash
npm install -g vercel
vercel --prod
```

Then follow the install steps above using your Vercel URL.

### Option C — Local network (test on phone while developing)

```bash
npm run dev -- --host
```

Your terminal will show a local network URL like `http://192.168.1.x:5173`.  
Open that on your phone while connected to the same WiFi.  
*(PWA install may not work over plain HTTP, but the app will run)*

---

## 🤖 AI Suggestions Setup

The AI feature calls the Anthropic Claude API directly from the browser.

By default, API calls require a key. To enable AI suggestions in production:

1. Create a `.env.local` file:
   ```
   VITE_ANTHROPIC_API_KEY=your_key_here
   ```

2. Update `src/components/AISuggestModal.jsx` to include the header:
   ```js
   headers: {
     'Content-Type': 'application/json',
     'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
     'anthropic-version': '2023-06-01',
   }
   ```

> **Note**: For production apps, proxy the API call through your own backend to keep the API key secret.

---

## 📂 Project Structure

```
meal-planner-pwa/
├── public/
│   └── icons/             # PWA icons (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── UI.jsx          # Shared components (Icon, Tag, Modal, Btn...)
│   │   ├── RecipeCard.jsx  # Recipe display card
│   │   └── AISuggestModal.jsx
│   ├── views/
│   │   ├── PlannerView.jsx
│   │   ├── RecipesView.jsx
│   │   ├── GroceryView.jsx
│   │   ├── PantryView.jsx
│   │   └── NutritionView.jsx
│   ├── hooks/
│   │   └── useStorage.js   # localStorage persistence hook
│   ├── data.js             # Sample data & constants
│   ├── App.jsx             # Root app + bottom navigation
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js          # Vite + PWA plugin config
└── package.json
```

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **vite-plugin-pwa** — Service worker + manifest generation
- **Workbox** — Offline caching strategy
- **localStorage** — Persistent client-side storage
- **Claude API** — AI recipe generation

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview the production build locally |
