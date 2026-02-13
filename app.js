const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("../stayfinder-mern/models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");

MONGO_URL="mongodb://127.0.0.1:27017/stayfinder";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});


//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

//Route for the creation of new list: includes new and the create route...
//New Route
app.get("/listings/new", (req, res) =>{
    res.render("listings/new");
});


//Create Route
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});


//Route for Updations includes edit and update route

//Edit Route
app.get("/listings/:id/edit", async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit", {listing});
});

//Update Route
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});


//Delete Route
app.delete("/listings/:id", async (req, res)=>{
    const { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})

//Show Route
app.get("/listings/:id", async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show", {listing});
});

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});