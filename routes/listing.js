const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const multer  = require('multer') // multer is used to upload files
const {storage} = require("../cloudConfig.js");// Files will be uploaded to storage in cloudinary.
const upload = multer({ storage }) ; // now multer uploads our files in cloudinary storage


const ListingController = require("../controllers/listings.js");

// listings routes
router
    .route("/")
    .get(wrapAsync(ListingController.index)) //Index route
    .post(isLoggedIn, upload.single('listing[image]') , validateListing , wrapAsync(ListingController.createListing)) //Create route



//New Route
router.get("/new",isLoggedIn,ListingController.renderNewForm);

// Category Route
router.post("/category", wrapAsync(ListingController.showCategory));

// Search  Route
router.get("/search", wrapAsync(ListingController.showSearch));


// listings/:id routes
router
    .route("/:id")
    .get(wrapAsync(ListingController.showListing))  //Show route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing , wrapAsync(ListingController.updateListing)) //Update route
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.deleteListing)) // Delete route


//Edit Route
router.get("/:id/edit" , isLoggedIn , isOwner, wrapAsync(ListingController.renderEditForm));

module.exports= router;