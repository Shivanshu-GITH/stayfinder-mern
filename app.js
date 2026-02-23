const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const Listing = require("./models/listing");
const Review = require("./models/reviews");
const User = require("./models/User");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

// 🔐 AUTHORIZATION MIDDLEWARE
const {
  validateListing,
  isLoggedIn,
  isListingOwner,
  isReviewAuthor,
} = require("./middleware");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayfinder";

// ================= DB =================
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

// ================= APP CONFIG =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================
app.use(
  session({
    secret: "stayfindersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
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

// ================= AUTH ROUTES =================

// Signup
app.get("/signup", (req, res) => {
  res.render("users/signup");
});

app.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
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
  })
);

// Login
app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

// Logout
app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// ================= LISTINGS =================

// Index
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// New
app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Create
app.post(
  "/listings",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // 🔐 OWNER SET
    await newListing.save();

    req.flash("success", "New listing created successfully");
    res.redirect("/listings");
  })
);

// Show
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
      .populate("reviews")
      .populate("owner");

    if (!listing) throw new ExpressError("Listing not found", 404);
    res.render("listings/show", { listing });
  })
);

// Edit
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError("Listing not found", 404);
    res.render("listings/edit", { listing });
  })
);

// Update
app.put(
  "/listings/:id",
  isLoggedIn,
  isListingOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.listing,
      { runValidators: true }
    );

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Delete
app.delete(
  "/listings/:id",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
  })
);

// ================= REVIEWS =================

// Create Review
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError("Listing not found", 404);

    const review = new Review(req.body.review);
    review.author = req.user._id; // 🔐 AUTHOR SET

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review
app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
  })
);

// ================= ERRORS =================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", {
    statusCode,
    message,
  });
});

// ================= SERVER =================
app.listen(8080, () => {
  console.log("Server running on port 8080");
});