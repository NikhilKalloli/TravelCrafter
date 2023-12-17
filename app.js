const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path =require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); 
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

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

const validateListing = (req,res,next)=>{
    let {error, value} = listingSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        req.body.listing.image = value.listing.image || undefined;
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error, value} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Index Route
app.get("/listings", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs",{ allListings });
}));


//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{ listing })
}));

//Create Route
app.post("/listings",  
        validateListing,
        wrapAsync(async (req,res,next)=>{
        let listing = req.body.listing;  // It's a object 
        // console.log(listing);
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listings");
   })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    // console.log(listing.image);
    res.render("listings/edit.ejs",{listing});

}));

//Update Route
app.put("/listings/:id", validateListing , wrapAsync(async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);

}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    res.redirect("/listings");
}));


//Reviews --> Post request
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));


// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
}));




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

app.all("*",(req,res,next)=>{
    next(new ExpressError(404 ,"Page not found"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("errors/error.ejs",{message});
})

app.listen(PORT,()=>{
    console.log(`App is listening on PORT: http://localhost:${PORT}`);
})