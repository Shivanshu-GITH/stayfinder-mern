<div align="center">

# 🏡 StayFinder

**A full-stack Airbnb-inspired vacation rental platform built with the MERN stack**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Hosting-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Screenshots](#-screenshots) · [Contributing](#-contributing)

</div>

---

## 📖 Overview

StayFinder is a full-stack web application that lets users **discover**, **list**, and **review** short-term rental properties around the world. Hosts can create listings with multiple photos, a location-aware map, and category tags. Guests can search and filter by title, location, price range, and category — then save favourites to a personal wishlist.

Built with **Express + EJS** on the server, **MongoDB Atlas** for persistence, **Cloudinary** for image management, and **Leaflet/OpenStreetMap** for interactive maps — all wired together with Passport.js authentication and session management.

---

## ✨ Features

| Area | What it does |
|---|---|
| 🔐 **Auth** | Sign up, log in, log out via Passport Local Strategy + session persistence in MongoDB |
| 🏠 **Listings** | Full CRUD — create, browse, edit, and delete property listings |
| 🖼 **Multi-Image Upload** | Upload up to 5 images per listing via Cloudinary; delete individual images from the edit page |
| 🗺 **Interactive Map** | Auto-geocodes listing location using Nominatim (OpenStreetMap) and renders a pin on Leaflet |
| 🔍 **Search & Filter** | Filter by keyword, price range, and category; sort by price ascending or descending |
| ⭐ **Reviews** | Authenticated users can post 1–5 star reviews with comments; authors can delete their own |
| ❤️ **Wishlist** | Save and remove listings from a personal wishlist, visible from the dashboard |
| 📊 **Dashboard** | Per-user stats — total listings created, reviews written, and reviews received |
| 🛡 **Authorization** | Route-level guards ensure only listing owners can edit/delete; review authors can delete reviews |
| 📦 **Seed Script** | Fully automated seed that uploads real images to Cloudinary and geocodes every listing |

---

## 🛠 Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [Mongoose 9](https://mongoosejs.com/) / [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Passport.js](https://www.passportjs.org/) (Local Strategy, `passport-local-mongoose`)
- [express-session](https://github.com/expressjs/session) + [connect-mongo](https://github.com/jdesboeufs/connect-mongo)
- [Multer](https://github.com/expressjs/multer) + [multer-storage-cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)
- [Joi](https://joi.dev/) — server-side schema validation
- [Axios](https://axios-http.com/) — Nominatim geocoding requests

**Frontend**
- [EJS](https://ejs.co/) + [ejs-mate](https://github.com/JacksonTian/ejs-mate) layouts
- [Bootstrap 5](https://getbootstrap.com/) + custom CSS
- [Leaflet.js](https://leafletjs.com/) — interactive maps

**Cloud & DevOps**
- [Cloudinary](https://cloudinary.com/) — image storage & transformations
- [MongoDB Atlas](https://www.mongodb.com/atlas) — managed cloud database
- [dotenv](https://github.com/motdotla/dotenv) — environment variable management

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

### 1 · Clone the repository

```bash
git clone https://github.com/Shivanshu-GITH/stayfinder-mern.git
cd stayfinder-mern
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Configure environment variables

Create a `.env` file in the project root:

```env
# MongoDB Atlas connection string
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stayfinder

# Cloudinary credentials (from your Cloudinary dashboard)
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret

# A long random string for session signing
SESSION_SECRET=your_super_secret_random_string
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4 · Seed the database (optional but recommended)

The seed script creates demo users and 50+ real listings with Cloudinary-hosted images and geocoded coordinates:

```bash
node init/seed.js
```

> This makes real Nominatim and Cloudinary API calls and may take 2–5 minutes.

### 5 · Start the development server

```bash
npm run dev       # nodemon — auto-restarts on file changes
# or
npm start         # plain node
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📁 Project Structure

```
stayfinder-mern/
├── app.js                  # Express app — routes, middleware, server
├── middleware.js           # validateListing · isLoggedIn · isListingOwner · isReviewAuthor
├── schemas.js              # Joi validation schemas for listings and reviews
│
├── models/
│   ├── listing.js          # Listing schema (images, geometry, category, owner, reviews)
│   ├── reviews.js          # Review schema (rating, comment, author)
│   └── user.js             # User schema (email, wishlist) + passport-local-mongoose
│
├── cloudConfig/
│   └── cloudinary.js       # Cloudinary v2 config + Multer CloudinaryStorage engine
│
├── init/
│   ├── data.js             # Raw seed data (titles, locations, descriptions)
│   ├── seed.js             # Full seed script — uploads images + geocodes listings
│   ├── fix_images.js       # Utility to repair image URLs in existing documents
│   └── index.js            # Minimal listing model for seeding without full app deps
│
├── utils/
│   ├── ExpressError.js     # Custom error class (message + statusCode)
│   └── wrapAsync.js        # Async error forwarding wrapper for route handlers
│
├── views/
│   ├── home.ejs            # Landing page
│   ├── error.ejs           # Error page
│   ├── layouts/
│   │   └── boilerplate.ejs # Base HTML layout (Bootstrap, Font Awesome, Leaflet CDN)
│   ├── includes/
│   │   ├── navbar.ejs      # Responsive sticky navbar with auth-aware links
│   │   └── footer.ejs      # Footer with links and social icons
│   ├── listings/
│   │   ├── index.ejs       # Browse all listings with search/filter
│   │   ├── show.ejs        # Single listing detail + map + reviews
│   │   ├── new.ejs         # Create listing form
│   │   └── edit.ejs        # Edit listing form (with image management)
│   └── users/
│       ├── login.ejs       # Login form
│       ├── signup.ejs      # Signup form
│       ├── dashboard.ejs   # User dashboard (stats + wishlist + own listings)
│       └── wishlist.ejs    # Saved listings
│
├── public/
│   ├── css/                # Page-specific stylesheets
│   ├── js/
│   │   ├── map.js          # Leaflet map initialisation for show page
│   │   └── script.js       # Bootstrap toast auto-dismiss
│   └── logo.png
│
├── .env                    # ← create this locally (see step 3)
├── .gitignore
└── package.json
```

---

## 🔌 API Reference

All routes are server-rendered (EJS). The table below documents every endpoint.

### Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/` | Public | Landing / home page |
| `GET` | `/signup` | Public | Signup form |
| `POST` | `/signup` | Public | Register new user, auto-login |
| `GET` | `/login` | Public | Login form |
| `POST` | `/login` | Public | Authenticate via Passport |
| `GET` | `/logout` | Authenticated | Destroy session, redirect |

### Listings

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/listings` | Public | Browse all listings; supports `?search`, `?minPrice`, `?maxPrice`, `?category`, `?sort` |
| `GET` | `/listings/new` | Authenticated | New listing form |
| `POST` | `/listings` | Authenticated | Create listing (up to 5 images, auto-geocode) |
| `GET` | `/listings/:id` | Public | Show single listing with map and reviews |
| `GET` | `/listings/:id/edit` | Owner | Edit form |
| `PUT` | `/listings/:id` | Owner | Update listing details and/or images |
| `DELETE` | `/listings/:id` | Owner | Delete listing + purge images from Cloudinary |
| `DELETE` | `/listings/:id/images` | Owner | Delete a single image from listing |

### Reviews

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/listings/:id/reviews` | Authenticated | Add a review to a listing |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Review Author | Delete own review |

### Wishlist

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/wishlist` | Authenticated | View saved listings |
| `POST` | `/listings/:id/wishlist` | Authenticated | Save listing to wishlist |
| `DELETE` | `/listings/:id/wishlist` | Authenticated | Remove listing from wishlist |

### User

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/dashboard` | Authenticated | Stats, wishlist, and own listings |

---

## 🗂 Listing Categories

Listings are tagged with one of 14 categories used for filtering:

`Apartment` · `House` · `Villa` · `Hotel` · `Hostel` · `Resort` · `Cottage` · `Cabin` · `Farm Stay` · `Camping` · `Luxury` · `Beachfront` · `Mountain View` · `City Stay`

---

## 🔒 Security Notes

- Passwords are hashed by `passport-local-mongoose` (uses `pbkdf2`).
- Sessions are stored in MongoDB with an encrypted secret via `connect-mongo`.
- Session cookies are `httpOnly` and expire after 7 days.
- All write routes are guarded by `isLoggedIn`, `isListingOwner`, or `isReviewAuthor` middleware.
- Listing inputs are validated server-side with Joi before hitting the database.
- **Do not commit your `.env` file** — it contains your database URI and Cloudinary secret.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

Distributed under the [ISC License](LICENSE).

---

<div align="center">

Built with ❤️ by [Shivanshu](https://github.com/Shivanshu-GITH)

</div>
