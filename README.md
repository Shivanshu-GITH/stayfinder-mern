<div align="center">

# 🏡 StayFinder

**A full-stack Airbnb-inspired vacation rental platform built with Express, EJS, MongoDB, and Firebase**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Hosting-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Authentication](#-authentication) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## 📖 Overview

StayFinder is a full-stack web application that lets users **discover**, **list**, and **review** short-term rental properties from around the world. Hosts can create listings with multiple photos, a location-aware interactive map, and category tags. Guests can search and filter by keyword, location, price range, and category — then save favourites to a personal wishlist.

Built with **Express 5 + EJS** on the server, **MongoDB Atlas** for persistence, **Firebase** for authentication (email/password + Google Sign-In + password reset), **Cloudinary** for image management, and **Leaflet/OpenStreetMap** for interactive maps — with Passport.js bridging Firebase sessions to Express's standard session middleware.

---

## ✨ Features

| Area | What it does |
|---|---|
| 🔐 **Auth** | Sign up and log in via email/password or Google — powered by Firebase SDK on the client with Passport.js session persistence on the server |
| 🔑 **Password Reset** | Firebase-powered "Forgot password?" email flow directly from the login page |
| 🏠 **Listings** | Full CRUD — create, browse, edit, and delete property listings |
| 🖼 **Multi-Image Upload** | Upload up to 5 images per listing via Cloudinary; delete individual images from the edit page |
| 🗺 **Interactive Map** | Auto-geocodes listing location using Nominatim (OpenStreetMap) and renders a pin on Leaflet; falls back to New Delhi coordinates on geocoding failure |
| 🔍 **Search & Filter** | Filter by keyword (title or location), price range (min/max), and category; sort by price ascending or descending |
| ⭐ **Reviews** | Authenticated users can post 1–5 star reviews with comments; authors can delete their own |
| ❤️ **Wishlist** | Save and remove listings from a personal wishlist, visible from the dashboard |
| 📊 **Dashboard** | Per-user stats — total listings created, reviews written, reviews received, and saved (wishlisted) listings |
| 🛡 **Authorization** | Route-level middleware ensures only listing owners can edit/delete; review authors can delete their own reviews |
| 🩺 **Health Check** | `GET /health` returns live MongoDB connection state and ping result — ready for uptime monitors |
| 📦 **Seed Script** | Fully automated seed that creates 30 realistic users and 80+ global listings, uploads 5 Unsplash images per listing to Cloudinary, and geocodes every location |

---

## 🛠 Tech Stack

### Backend

- [Node.js](https://nodejs.org/) 18+ + [Express 5](https://expressjs.com/)
- [Mongoose 9](https://mongoosejs.com/) / [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Passport.js](https://www.passportjs.org/) (Local Strategy, `passport-local-mongoose`) — used as the session bridge after Firebase token exchange
- [express-session](https://github.com/expressjs/session) + [connect-mongo](https://github.com/jdesboeufs/connect-mongo) — sessions stored and encrypted in MongoDB
- [Multer](https://github.com/expressjs/multer) + [multer-storage-cloudinary](https://github.com/affanshahid/multer-storage-cloudinary) — image upload pipeline
- [Joi](https://joi.dev/) — server-side schema validation for listings
- [Axios](https://axios-http.com/) — Nominatim geocoding + Firebase token verification

### Frontend

- [EJS](https://ejs.co/) + [ejs-mate](https://github.com/JacksonTian/ejs-mate) layouts
- [Bootstrap 5](https://getbootstrap.com/) + custom page-level CSS
- [Leaflet.js](https://leafletjs.com/) — interactive maps (CDN)
- [Firebase JS SDK v10](https://firebase.google.com/docs/web/setup) — loaded via ESM from `gstatic.com` on auth pages only

### Cloud & DevOps

- [Cloudinary](https://cloudinary.com/) — image storage, transformations, and CDN delivery
- [MongoDB Atlas](https://www.mongodb.com/atlas) — managed cloud database
- [Firebase Authentication](https://firebase.google.com/products/auth) — identity provider (email/password + Google OAuth)
- [dotenv](https://github.com/motdotla/dotenv) — environment variable management

---

## 🔐 Authentication

StayFinder uses a **dual-layer auth architecture**: Firebase handles identity on the client (email/password account creation, Google Sign-In popup, password reset emails), while the Express server maintains traditional sessions via Passport.js after verifying each Firebase ID token.

### How it works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User authenticates via Firebase SDK in the browser           │
│     (createUserWithEmailAndPassword / signInWithEmailAndPassword  │
│      / signInWithPopup with GoogleAuthProvider)                   │
│                                                                  │
│  2. Browser gets a short-lived Firebase ID token                 │
│                                                                  │
│  3. Browser POSTs to POST /auth/firebase { idToken, username }   │
│                                                                  │
│  4. Server verifies the token with Firebase Identity Toolkit API │
│     (identitytoolkit.googleapis.com/v1/accounts:lookup)          │
│                                                                  │
│  5. Server upserts the user in MongoDB:                          │
│     - New user → created with firebaseUid + authProvider         │
│     - Existing user (by email or firebaseUid) → updated          │
│     - Username collisions resolved automatically with suffix      │
│                                                                  │
│  6. Server calls req.login() → Passport establishes session      │
│                                                                  │
│  7. All subsequent page requests use the Passport session cookie  │
└─────────────────────────────────────────────────────────────────┘
```

### Auth methods supported

| Method | Flow |
|---|---|
| **Email/password signup** | Firebase `createUserWithEmailAndPassword` → `POST /auth/firebase` |
| **Email/password login** | Firebase `signInWithEmailAndPassword` → `POST /auth/firebase` |
| **Google Sign-In** | Firebase `signInWithPopup(GoogleAuthProvider)` → `POST /auth/firebase` |
| **Forgot password** | Firebase `sendPasswordResetEmail` — no server round-trip needed |
| **Logout** | `GET /logout` → Passport `req.logout()` → session destroyed |

### User model fields

The `User` schema extends `passport-local-mongoose` with:
- `email` — unique, required
- `firebaseUid` — sparse unique index (null for users who haven't gone through Firebase yet)
- `authProvider` — `"email"` or `"google"`
- `wishlist` — array of `ObjectId` refs to `Listing`

### Security notes

- Passwords are hashed by `passport-local-mongoose` (PBKDF2).
- Firebase ID tokens are verified server-side on every `POST /auth/firebase` call — they are never trusted without verification.
- Sessions are stored in MongoDB with an encrypted secret via `connect-mongo`.
- Session cookies are `httpOnly`, `SameSite=lax`, and `Secure` in production.
- Sessions expire after 7 days.
- All write routes are guarded by `isLoggedIn`, `isListingOwner`, or `isReviewAuthor` middleware.
- The server sets `trust proxy: 1` in production so cookies are flagged `Secure` correctly behind Render/Railway/NGINX.
- `x-powered-by` header is disabled.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)
- A [Firebase](https://firebase.google.com/) project with **Authentication** enabled

### 1 · Clone the repository

```bash
git clone https://github.com/Shivanshu-GITH/stayfinder-mern.git
cd stayfinder-mern
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project (free Spark plan works).
2. Enable **Authentication** → **Sign-in method** → turn on **Email/Password** and **Google**.
3. Add `localhost` (and your production domain) to **Authorized domains**.
4. Go to **Project Settings** → **Your apps** → add a **Web app** and copy the config values.
5. Note your **Web API Key** — this is `FIREBASE_API_KEY` below.

### 4 · Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# MongoDB Atlas connection string
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stayfinder?retryWrites=true&w=majority

# Cloudinary credentials (from your Cloudinary dashboard)
CLOUD_NAME=your_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Session secret — use a long random string (32+ chars)
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=replace_with_a_long_random_secret_string

# App server port (optional, defaults to 8081)
PORT=8081

# Firebase project config
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

The server validates all required env vars at startup and throws a descriptive error if any are missing.

### 5 · Seed the database (optional but recommended)

The seed script creates 30 realistic users and 80+ listings across every category, each with 5 Cloudinary-hosted Unsplash images and geocoded coordinates:

```bash
node init/seed.js
```

> This makes real Nominatim and Cloudinary API calls and may take 5–10 minutes. All demo users share the password `Pass@1234`.

### 6 · Start the development server

```bash
npm run dev       # nodemon — auto-restarts on file changes
# or
npm start         # plain node
```

Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 📁 Project Structure

```
stayfinder-mern/
├── app.js                      # Express app — all routes, middleware, and server bootstrap
├── middleware.js               # validateListing · isLoggedIn · isListingOwner · isReviewAuthor
├── schemas.js                  # Joi validation schemas for listings and reviews
│
├── models/
│   ├── listing.js              # Listing schema: images, geometry, category, owner, reviews
│   │                           # — virtual: imageThumbnails (Cloudinary w_300 transform)
│   │                           # — index: { title: "text", location: "text" }
│   ├── reviews.js              # Review schema: rating (1–5), comment, author ref; timestamps
│   └── user.js                 # User schema: email, firebaseUid (sparse), authProvider,
│                               #   wishlist[] + passport-local-mongoose plugin
│
├── cloudConfig/
│   └── cloudinary.js           # Cloudinary v2 config + Multer CloudinaryStorage engine
│                               # — uploads to folder: "stayfinder_images"
│                               # — allowed formats: jpg, png, jpeg
│
├── init/
│   ├── data.js                 # Legacy sample listings (30 entries) — used by older seed
│   ├── seed.js                 # Full seed: 30 users + 80+ global listings
│   │                           # — 5 Unsplash images uploaded to Cloudinary per listing
│   │                           # — Nominatim geocoding with 1.1s rate-limit delay
│   │                           # — Automatic fallback to New Delhi on geocode failure
│   ├── fix_images.js           # Utility to repair image URLs in existing documents
│   └── index.js                # Minimal listing model for seeding without full app deps
│
├── utils/
│   ├── ExpressError.js         # Custom error class (message + statusCode)
│   └── wrapAsync.js            # Async error forwarding wrapper for route handlers
│
├── views/
│   ├── home.ejs                # Landing page
│   ├── error.ejs               # Error page (statusCode + message)
│   ├── layouts/
│   │   └── boilerplate.ejs     # Base HTML layout (Bootstrap 5, Font Awesome, Leaflet CDN)
│   ├── includes/
│   │   ├── navbar.ejs          # Responsive sticky navbar with auth-aware links
│   │   └── footer.ejs          # Footer with links and social icons
│   ├── listings/
│   │   ├── index.ejs           # Browse all listings: search + filter bar + card grid
│   │   ├── show.ejs            # Single listing: image gallery + Leaflet map + reviews
│   │   ├── new.ejs             # Create listing form (multi-image upload)
│   │   └── edit.ejs            # Edit listing: update fields + manage/delete images
│   └── users/
│       ├── login.ejs           # Email/password login + Google Sign-In + Forgot password
│       ├── signup.ejs          # Email/password signup + Google Sign-Up
│       ├── dashboard.ejs       # Stats + wishlist + own listings
│       └── wishlist.ejs        # Saved (wishlisted) listings
│
├── public/
│   ├── css/
│   │   ├── style.css           # Global styles
│   │   ├── home.css            # Landing page styles
│   │   ├── auth-login.css      # Login page styles
│   │   ├── auth-signup.css     # Signup page styles
│   │   └── dashboard.css       # Dashboard styles
│   ├── js/
│   │   ├── map.js              # Leaflet map initialisation for the show page
│   │   └── script.js           # Bootstrap toast auto-dismiss
│   └── logo.png
│
├── .env.example                # ← all required env vars documented
├── .env                        # ← create this locally (see Getting Started)
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

---

## 🔌 API Reference

All routes are server-rendered (EJS). The table below documents every endpoint.

### Home & Health

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/` | Public | Landing page |
| `GET` | `/health` | Public | MongoDB connection state + admin ping. Returns `{ status, dbState, dbPing }`. HTTP 200 if healthy, 503 if degraded. |

### Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/signup` | Public | Signup page — injects Firebase config for client-side SDK |
| `POST` | `/signup` | Public | Legacy local signup (Passport). Creates user, auto-logs in, redirects to `/listings`. |
| `GET` | `/login` | Public | Login page — injects Firebase config for client-side SDK |
| `POST` | `/login` | Public | Passport local strategy authentication. On success, redirects to `/listings`. |
| `POST` | `/auth/firebase` | Public | **Primary auth endpoint.** Accepts `{ idToken, username? }`. Verifies token with Firebase, upserts user in MongoDB, calls `req.login()` to establish Passport session. Returns `{ ok, redirectTo }`. |
| `GET` | `/logout` | Authenticated | Calls `req.logout()`, destroys session, redirects to `/listings`. |

### Listings

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/listings` | Public | Browse all listings. Query params: `?search`, `?minPrice`, `?maxPrice`, `?category`, `?sort` (`low`/`high`). |
| `GET` | `/listings/new` | Authenticated | New listing form |
| `POST` | `/listings` | Authenticated | Create listing. Accepts up to 5 images (Cloudinary upload). Auto-geocodes `location` via Nominatim. Joi-validated. |
| `GET` | `/listings/:id` | Public | Single listing — image gallery, Leaflet map, reviews, wishlist toggle state |
| `GET` | `/listings/:id/edit` | Owner | Edit form |
| `PUT` | `/listings/:id` | Owner | Update listing details. Additional images appended (up to 5 total per upload batch). Joi-validated. |
| `DELETE` | `/listings/:id` | Owner | Delete listing + purge all images from Cloudinary |
| `DELETE` | `/listings/:id/images` | Owner | Delete a single image (by `filename`) from listing + Cloudinary |

### Reviews

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/listings/:id/reviews` | Authenticated | Add a review (rating 1–5, comment min 5 chars) to a listing |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Review Author | Delete own review; also removes ref from listing |

### Wishlist

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/wishlist` | Authenticated | View saved listings |
| `POST` | `/listings/:id/wishlist` | Authenticated | Save listing to wishlist (deduplication handled) |
| `DELETE` | `/listings/:id/wishlist` | Authenticated | Remove listing from wishlist |

### User Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/dashboard` | Authenticated | Aggregated stats: saved listings count, own listing count, reviews written, reviews received on own listings; + wishlist + own listing grid |

---

## 🗂 Listing Categories

Listings are tagged with one of 14 categories enforced at both the Joi schema and Mongoose enum level:

| Category | Category | Category | Category |
|---|---|---|---|
| Apartment | House | Villa | Hotel |
| Hostel | Resort | Cottage | Cabin |
| Farm Stay | Camping | Luxury | Beachfront |
| Mountain View | City Stay | | |

---

## 🗃 Data Models

### Listing

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | |
| `images` | `[{ url, filename }]` | Cloudinary URLs + public IDs |
| `price` | Number | |
| `location` | String | Display address |
| `country` | String | |
| `category` | String (enum) | 14 options; default `"Apartment"` |
| `geometry` | GeoJSON Point | `{ type: "Point", coordinates: [lng, lat] }` |
| `owner` | ObjectId → User | |
| `reviews` | [ObjectId → Review] | |

**Virtuals:** `imageThumbnails` — maps each Cloudinary URL to a 300px-wide version via URL transform.

**Indexes:** `{ title: "text", location: "text" }` — supports `$text` search; also enables regex-based search in the current query implementation.

### Review

| Field | Type | Notes |
|---|---|---|
| `comment` | String | Required, min 5 chars, trimmed |
| `rating` | Number | Required, 1–5 |
| `author` | ObjectId → User | |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

### User

| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique; from `passport-local-mongoose` |
| `email` | String | Unique, required |
| `firebaseUid` | String | Sparse unique index — populated on first Firebase sign-in |
| `authProvider` | String (enum) | `"email"` or `"google"` |
| `wishlist` | [ObjectId → Listing] | |
| `hash`, `salt` | String | Managed by `passport-local-mongoose` (PBKDF2) |

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Password hashing | PBKDF2 via `passport-local-mongoose` |
| Firebase token verification | Server-side call to `identitytoolkit.googleapis.com/v1/accounts:lookup` on every Firebase sign-in |
| Session cookie | `httpOnly: true`, `sameSite: "lax"`, `secure: true` in production; 7-day expiry |
| Session storage | MongoDB via `connect-mongo`; encrypted with `SESSION_SECRET` |
| Proxy awareness | `app.set("trust proxy", 1)` in production for correct `Secure` cookie flag behind Render/Railway/NGINX |
| Input validation | Joi schemas validate all listing + review payloads before they hit the database |
| Image uploads | Multer restricts to `jpg`, `png`, `jpeg`; max 5 files per request |
| Auth guards | `isLoggedIn`, `isListingOwner`, `isReviewAuthor` middleware on all write routes |
| Info leakage | `app.disable("x-powered-by")` removes the Express fingerprint header |
| Env secrets | `.env` is `.gitignore`d; required vars validated at startup with descriptive errors |

---

## 🗺 Geocoding

When a listing is created or the seed script runs, the `getCoordinates(location)` function calls the **Nominatim OpenStreetMap API**:

```
GET https://nominatim.openstreetmap.org/search?format=json&q=<location>&limit=1
User-Agent: stayfinder-app
```

- On success, the returned `lat`/`lon` are stored as a GeoJSON Point in `listing.geometry`.
- On failure or empty result, coordinates fall back to **New Delhi (28.6139, 77.2090)**.
- The seed script adds a 1.1-second delay between geocoding calls to respect Nominatim's usage policy (max 1 req/sec).

Coordinates are used by **Leaflet.js** on the listing show page to render an interactive pin map.

---

## 🌱 Seed Script

`init/seed.js` populates the database with production-quality demo data:

- **30 users** across 20+ countries with realistic usernames and emails (all use `Pass@1234`)
- **80+ listings** spanning all 14 categories, covering locations across India, Europe, Asia, the Americas, Africa, and Oceania
- **5 Cloudinary-hosted images** per listing (sourced from Unsplash via direct photo IDs, uploaded with `w_1200, h_800, crop=fill, quality=auto` transformations)
- **Geocoded coordinates** for every listing with a 1.1s Nominatim rate-limit delay
- Clears all existing `Listing` and `User` documents before seeding

```bash
node init/seed.js
```

Expected output:
```
✅ Connected to MongoDB

🗑  Cleared existing data

👤 Creating users...
   ✔ james_miller
   ✔ jan_devries
   ...

🏠 Inserting listings...

[1/83] Skyline Studio in Manhattan
   📍 40.7484, -73.9967
   🖼  5 images uploaded ✔
   ✅ Saved

...

🎉 Seeding complete! Listings: 83 | Users: 30
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow. Quick summary:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, etc.
4. Push and open a Pull Request

**Before submitting:** make sure the app starts cleanly (`npm run dev`), test your change against a real MongoDB Atlas cluster, and ensure no env secrets are committed.

Report bugs via [GitHub Issues](https://github.com/Shivanshu-GITH/stayfinder-mern/issues) — include steps to reproduce, expected vs actual behaviour, and your Node.js version.

---

## 📄 License

Distributed under the [ISC License](LICENSE).

---

<div align="center">

Built with ❤️ by [Shivanshu](https://github.com/Shivanshu-GITH)

</div>
