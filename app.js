const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path =require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const PORT = 3000;

const MONGO_URL = "mongodb://127.0.0.1:27017/TravelCrafter"

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req,res)=>{
    res.send("Home page");
})

//Index Route
app.get("/listings", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
});


//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});

//Show Route
app.get("/listings/:id", async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{ listing })
})

//Create Route
app.post("/listings", async (req,res)=>{
    // let {title, description, image, price, country, location} = req.body;
    let listing = req.body.listing;  // It's a object 
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");

});

//Edit Route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

})

//Update Route
app.put("/listings/:id", async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);

})

//Delete Route
app.delete("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})




// app.get("/testListing",async (req,res)=>{
//     let samplListing = new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India"
//     })
//     await samplListing.save();
//     console.log("Sample saved");
//     res.send("Succesful saved")
// })

app.listen(PORT,()=>{
    console.log(`App is listening on PORT: http://localhost:${PORT}`);
})