const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js"); 
const {listingSchema , reviewSchema} = require("./schema.js");



module.exports.isLoggedIn =  (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create Listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have the permission to edit this");
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error, value} = listingSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        req.body.listing.image = value.listing.image || undefined;
        next();
    }
}

module.exports.validateReview = (req,res,next)=>{
    let {error, value} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}



module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId}= req.params;

    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have the permission to delete this");
        return res.redirect(`/listings/${id}`)
    }
    next();
}


