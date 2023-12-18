const Listing = require("../models/listing.js");

module.exports.index = (async(req,res)=>{
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs",{ allListings });
});


module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = (async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id)
    .populate(
        {path:"reviews", 
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you reqested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing })
});

module.exports.createListing = (async (req,res,next)=>{
    let listing = req.body.listing;  // It's a object 
    // console.log(listing);
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing created!");
    res.redirect("/listings");
});

module.exports.renderEditForm = (async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    // console.log(listing.image);
    if(!listing){
        req.flash("error","Listing you reqested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});

});

module.exports.updateListing = (async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);

});

module.exports.deleteListing = (async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success","Listing Deleted!");

    res.redirect("/listings");
});