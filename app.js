// ================= REQUIRED PACKAGES =================
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;

const Listing = require("./models/listing");
const Review = require("./models/reviews");
const User = require("./models/user");        // ← lowercase u (Linux fix)

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

const axios = require("axios");

// ================= IMAGE UPLOAD =================
const multer = require("multer");
const { storage, cloudinary } = require("./cloudConfig/cloudinary");
const upload = multer({ storage });

// ================= AUTH MIDDLEWARE =================
const {
  validateListing,
  isLoggedIn,
  isListingOwner,
  isReviewAuthor,
} = require("./middleware");

const PORT = Number(process.env.PORT) || 8081;
const requiredEnvVars = [
  "MONGO_URL",
  "SESSION_SECRET",
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_MEASUREMENT_ID",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const MONGO_URL = process.env.MONGO_URL;
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// ================= APP CONFIG =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");

mongoose.set("bufferCommands", false);
mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected");
});
mongoose.connection.on("error", err => {
  console.error("MongoDB connection error:", err.message);
});

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
  });
}

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  const dbRequiredPaths = ["/listings", "/dashboard", "/wishlist", "/auth/firebase", "/logout"];
  const requiresDb = dbRequiredPaths.some(
    routePath => req.path === routePath || req.path.startsWith(`${routePath}/`)
  );

  if (!requiresDb) return next();

  try {
    await ensureDbConnection();
    return next();
  } catch (err) {
    return next(new ExpressError("Database is temporarily unavailable. Please try again.", 503));
  }
});

// ================= SESSION =================
const sessionStore = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: { secret: process.env.SESSION_SECRET },
});

sessionStore.on("error", err => {
  console.error("Session store error:", err.message);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL LOCALS =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.path = req.path;
  next();
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  const stateText = ["disconnected", "connected", "connecting", "disconnecting"][state] || "unknown";
  let ping = "not-connected";

  if (state === 1) {
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
      ping = "ok";
    } catch (err) {
      ping = "failed";
    }
  }

  res.status(state === 1 && ping === "ok" ? 200 : 503).json({
    status: state === 1 && ping === "ok" ? "ok" : "degraded",
    dbState: stateText,
    dbPing: ping,
  });
});

// ================= AUTH =================
app.get("/signup", (req, res) => {
  res.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.render("users/signup", { firebaseConfig: FIREBASE_CONFIG });
});

app.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash("success", "Welcome to StayFinder!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}));

app.get("/login", (req, res) => {
  res.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.render("users/login", { firebaseConfig: FIREBASE_CONFIG });
});

async function getUniqueUsername(preferredUsername) {
  const base = (preferredUsername || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "user";

  let candidate = base;
  let counter = 1;
  while (await User.exists({ username: candidate })) {
    counter += 1;
    const suffix = `_${counter}`;
    candidate = `${base.slice(0, Math.max(1, 30 - suffix.length))}${suffix}`;
  }
  return candidate;
}

async function saveUserResolvingUsernameCollision(user, preferredUsername) {
  try {
    await user.save();
    return user;
  } catch (err) {
    const isDuplicateUsername =
      err?.code === 11000 &&
      (String(err?.message || "").includes("username_1") || "username" in (err?.keyPattern || {}));

    if (!isDuplicateUsername) throw err;

    user.username = await getUniqueUsername(preferredUsername || user.username || "user");
    await user.save();
    return user;
  }
}

app.post("/auth/firebase", wrapAsync(async (req, res, next) => {
  try {
    const { idToken, username } = req.body;
    if (!idToken) throw new ExpressError("Missing Firebase ID token", 400);

    const tokenLookup = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`,
      { idToken }
    );

    const firebaseUser = tokenLookup.data?.users?.[0];
    if (!firebaseUser || !firebaseUser.localId || !firebaseUser.email) {
      throw new ExpressError("Invalid Firebase auth token", 401);
    }

    const providerId = firebaseUser.providerUserInfo?.[0]?.providerId;
    const authProvider = providerId === "google.com" ? "google" : "email";
    const derivedUsername = (username || firebaseUser.displayName || firebaseUser.email.split("@")[0]).trim();

    let user = await User.findOne({
      $or: [{ firebaseUid: firebaseUser.localId }, { email: firebaseUser.email }],
    });

    if (!user) {
      const uniqueUsername = await getUniqueUsername(derivedUsername);
      user = new User({
        username: uniqueUsername,
        email: firebaseUser.email,
        firebaseUid: firebaseUser.localId,
        authProvider,
      });
      await saveUserResolvingUsernameCollision(user, derivedUsername);
    } else {
      let isUpdated = false;
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.localId;
        isUpdated = true;
      }
      if (!user.authProvider) {
        user.authProvider = authProvider;
        isUpdated = true;
      }
      if (!user.username) {
        user.username = await getUniqueUsername(derivedUsername);
        isUpdated = true;
      }
      if (isUpdated) {
        await saveUserResolvingUsernameCollision(user, derivedUsername);
      }
    }

    req.login(user, err => {
      if (err) return next(err);
      req.flash("success", "Welcome to StayFinder!");
      return res.json({ ok: true, redirectTo: "/listings" });
    });
  } catch (err) {
    const firebaseError = err.response?.data?.error?.message;
    if (firebaseError) {
      return res.status(401).json({ ok: false, message: firebaseError });
    }
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      ok: false,
      message: err.message || "Unable to create server session.",
    });
  }
}));

app.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// ================= SEARCH + FILTER =================
app.get("/listings", wrapAsync(async (req, res) => {
  const { search, minPrice, maxPrice, category, sort } = req.query;

  let query = {};

  if (search && search.trim() !== "") {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (category) {
    query.category = category;
  }

  let sortOption = {};
  if (sort === "low") sortOption.price = 1;
  if (sort === "high") sortOption.price = -1;

  const allListings = await Listing.find(query).sort(sortOption);

  res.render("listings/index", {
    allListings,
    query: req.query
  });
}));

// ================= FLEXIBLE GEOCODING =================
async function getCoordinates(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "stayfinder-app" }
    });

    if (response.data.length === 0) {
      return { lat: 28.6139, lon: 77.2090 };
    }

    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon)
    };

  } catch (err) {
    return { lat: 28.6139, lon: 77.2090 };
  }
}

// ================= NEW LISTING PAGE =================
app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// ================= CREATE =================
app.post("/listings",
  isLoggedIn,
  upload.array("images", 5),
  validateListing,
  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    const coords = await getCoordinates(req.body.listing.location);

    newListing.geometry = {
      type: "Point",
      coordinates: [coords.lon, coords.lat]
    };

    if (req.files && req.files.length > 0) {
      newListing.images = req.files.map(file => ({
        url: file.path,
        filename: file.filename
      }));
    }

    await newListing.save();

    req.flash("success", "New listing created successfully");
    res.redirect("/listings");
  })
);

// ================= SHOW =================
app.get("/listings/:id", wrapAsync(async (req, res) => {

  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) throw new ExpressError("Listing not found", 404);

  let isInWishlist = false;

  if (req.user) {
    const user = await User.findById(req.user._id);
    isInWishlist = user.wishlist.includes(listing._id);
  }

  res.render("listings/show", { listing, isInWishlist });
}));

// ================= EDIT PAGE =================
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  })
);

// ================= UPDATE =================
app.put("/listings/:id",
  isLoggedIn,
  isListingOwner,
  upload.array("images", 5),
  validateListing,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.listing,
      { new: true, runValidators: true }
    );

    if (req.files && req.files.length > 0) {
      const imgs = req.files.map(file => ({
        url: file.path,
        filename: file.filename
      }));
      listing.images.push(...imgs);
      await listing.save();
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${req.params.id}`);
  })
);

// ================= DELETE SINGLE IMAGE =================
app.delete("/listings/:id/images",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { filename } = req.body;

    await cloudinary.uploader.destroy(filename);

    await Listing.findByIdAndUpdate(id, {
      $pull: { images: { filename: filename } }
    });

    req.flash("success", "Image deleted successfully");
    res.redirect(`/listings/${id}/edit`);
  })
);

// ================= DELETE =================
app.delete("/listings/:id",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    for (let img of listing.images) {
      await cloudinary.uploader.destroy(img.filename);
    }

    await Listing.findByIdAndDelete(req.params.id);

    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
  })
);

// ================= REVIEWS =================
app.post("/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const review = new Review(req.body.review);
    review.author = req.user._id;

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${listing._id}`);
  })
);

// ================= DELETE REVIEW =================
app.delete("/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
  })
);

// ================= WISHLIST =================
app.post("/listings/:id/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.wishlist.includes(req.params.id)) {
    user.wishlist.push(req.params.id);
    await user.save();
  }

  res.redirect(`/listings/${req.params.id}`);
}));

app.delete("/listings/:id/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.id }
  });

  res.redirect(`/listings/${req.params.id}`);
}));

app.get("/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("users/wishlist", { listings: user.wishlist });
}));

// ================= DASHBOARD =================
app.get("/dashboard",
  isLoggedIn,
  wrapAsync(async (req, res) => {

    const user = await User.findById(req.user._id)
      .populate("wishlist");

    const reviewCount = await Review.countDocuments({
      author: req.user._id
    });

    const userListings = await Listing.find({
      owner: req.user._id
    });

    const listingCount = userListings.length;

    let reviewsReceived = 0;
    userListings.forEach(listing => {
      reviewsReceived += listing.reviews.length;
    });

    res.render("users/dashboard", {
      user,
      listings: user.wishlist,
      reviewCount,
      listingCount,
      reviewsReceived,
      userListings
    });
  })
);

// ================= ERROR =================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Request failed:", req.method, req.originalUrl, "-", err.message);
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", {
    statusCode,
    message
  });
});

// ================= SERVER =================
async function startServer() {
  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
  });
  console.log("Connected to DB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});