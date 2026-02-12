const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://unsplash.com/https://plus.unsplash.com/premium_photo-1687960116497-0dc41e1808a2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dphotos/two-chairs-sitting-in-front-of-a-swimming-pool-k_My4rXk4Lc",
        
        set: (v) => v===""?"https://unsplash.com/https://plus.unsplash.com/premium_photo-1687960116497-0dc41e1808a2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dphotos/two-chairs-sitting-in-front-of-a-swimming-pool-k_My4rXk4Lc": v,
    },
    price: Number,
    location: String,
    country: String,
});

const Listing= mongoose.model("Listing", listingSchema);
module.exports = Listing;