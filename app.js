// ================= REQUIRED PACKAGES =================
require("dotenv").config();

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

// ================= NEW PAGE =================
app.get("/listings/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// ================= CREATE LISTING =================
app.post(
  "/listings",
  isLoggedIn,
  upload.array("images", 5),
  validateListing,
  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    // save uploaded images
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

// ================= EDIT PAGE =================
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

// ================= UPDATE LISTING =================
app.put(
  "/listings/:id",
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

    // add new uploaded images if any
    if (req.files && req.files.length > 0) {

      const imgs = req.files.map(file => ({
        url: file.path,
        filename: file.filename
      }));

      // append new images instead of replacing old ones
      listing.images.push(...imgs);

      await listing.save(); 
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${req.params.id}`);

  })
);

// ================= DELETE SINGLE IMAGE =================
app.delete(
  "/listings/:id/images",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {

    const { id } = req.params;
    const { filename } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // delete image from cloudinary
    await cloudinary.uploader.destroy(filename);

    // remove image from array
    listing.images = listing.images.filter(
      img => img.filename !== filename
    );

    // if no images remain → delete entire listing
    if (listing.images.length === 0) {

      await Listing.findByIdAndDelete(id);

      req.flash("success", "Last image deleted. Listing removed.");
      return res.redirect("/listings");

    }

    await listing.save();

    req.flash("success", "Image deleted successfully");

    res.redirect(`/listings/${id}/edit`);
  })
);


// ================= DELETE LISTING =================
app.delete(
  "/listings/:id",
  isLoggedIn,
  isListingOwner,
  wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    // delete images from cloudinary
    for (let img of listing.images) {
      await cloudinary.uploader.destroy(img.filename);
    }

    await Listing.findByIdAndDelete(req.params.id);

    req.flash("success", "Listing deleted successfully");

    res.redirect("/listings");

  })
);

// ================= REVIEWS =================

// Add review
app.post(
  "/listings/:id/reviews",
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

// Delete review
app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {

    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");

    res.redirect(`/listings/${id}`);

  })
);

// ================= ERROR HANDLING =================

app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {

  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("error", {
    statusCode,
    message
  });

});

// ================= SERVER =================
app.listen(8080, () => {
  console.log("Server running on port 8080");
});