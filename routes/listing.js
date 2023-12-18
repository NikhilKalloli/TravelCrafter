const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const { Cursor } = require("mongoose");


const ListingController = require("../controllers/listings.js");


router
    .route("/")
    .get(wrapAsync(ListingController.index)) //Index route
    .post(isLoggedIn, validateListing, wrapAsync(ListingController.createListing)) //Create route

//New Route
router.get("/new",isLoggedIn,ListingController.renderNewForm);


router
    .route("/:id")
    .get(wrapAsync(ListingController.showListing))  //Show route
    .put(isLoggedIn, isOwner, validateListing , wrapAsync(ListingController.updateListing)) //Update route
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.deleteListing)) // Delete route

    

//Edit Route
router.get("/:id/edit" , isLoggedIn , isOwner, wrapAsync(ListingController.renderEditForm));

module.exports= router;