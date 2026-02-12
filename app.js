const express= require("express");
const app= express();
const mongoose= require("mongoose");

MONGO_URL="mongodb://127.0.0.1:27017/stayfinder";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});