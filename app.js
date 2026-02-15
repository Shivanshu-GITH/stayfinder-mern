const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const Listing = require("./models/listing.js");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { validateListing } = require("./middleware");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayfinder";
const SESSION_SECRET = "stayfindersecret";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);


app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New listing created successfully");
    res.redirect("/listings");
  })
);

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
    res.render("listings/show", { listing });
  })
);

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }
    res.render("listings/edit", { listing });
  })
);


app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.listing,
      {
        runValidators: true,
        returnDocument: "after"
      }
    );

    if (!listing) {
      throw new ExpressError("Cannot update non-existent listing", 404);
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${req.params.id}`);
  })
);

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      throw new ExpressError("Cannot delete non-existent listing", 404);
    }
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
  })
);


app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});


app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "The page you are looking for does not exist.";
  }

  if (statusCode === 500) {
    message = "Something went wrong on our side. Please try again later.";
  }

  console.error(err);

  if (req.headers.accept?.includes("application/json")) {
    return res.status(statusCode).json({
      status: "error",
      statusCode,
      message
    });
  }

  res.status(statusCode).render("error", {
    statusCode,
    message
  });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
