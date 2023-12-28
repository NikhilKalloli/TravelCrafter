const Listing = require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

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


module.exports.showCategory = (async (req,res)=>{


    const selectedCategory = req.body.selectedCategory;
    // console.log(selectedCategory);

    const allListings = await Listing.find({category:selectedCategory})
    // console.log(allListings);

    if(allListings.length==0){
        req.flash("error","The category you reqested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/showCategory.ejs",{ allListings, selectedCategory })
});

module.exports.showSearch = (async (req,res)=>{

    const searchedCountry = req.query.searchedCountry;
    // console.log(searchedCountry);

    const regexPattern = new RegExp(searchedCountry, 'i');

    // Find listings matching the regex pattern for the country
    const allListings = await Listing.find({ country: { $regex: regexPattern } });
    // console.log(allListings);


    if(allListings.length==0){
        req.flash("error","No listings found for the specified country.");
        res.redirect("/listings");
    }
    res.render("listings/searchCountry.ejs",{ allListings, searchedCountry })
}); 



module.exports.createListing = (async (req,res,next)=>{
    
    // Before saving listing we need to get the coordinates of the location.
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
      .send()
    
    // console.log(response.body.features[0].geometry);
       
    let url = req.file.path;
    let filename = req.file.filename;

    let listing = req.body.listing;  // It's a object 
    // console.log(listing);

    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

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
    let originalImageUrl = listing.image.url; // We are croping image using cloudinary api
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    // console.log(originalImageUrl);
    res.render("listings/edit.ejs",{listing, originalImageUrl});

});

module.exports.updateListing = (async (req,res)=>{
    let {id}= req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }


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