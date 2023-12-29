require('dotenv').config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const multer  = require('multer') // multer is used to upload files
const {storage} = require("../cloudConfig.js");// Files will be uploaded to storage in cloudinary.
const upload = multer({ storage }) ; // now multer uploads our files in cloudinary storage

const cloudinary = require('cloudinary').v2;

const dbUrl = process.env.ATLAS_DB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({...obj, owner: process.env.DB_ADMIN_ID}));
  let listings = await Listing.insertMany(initData.data);
  console.log("data was initialized");
};


initDB();

/* ********** This code it to upload the images to cloudinary so that we get the cropped preview whenever we try to edit ********
   ********** This is only for the images in data.js. New listings image will be stored automatically ************

*/


/*
const initDB = async () => {
  try {
    //To clear existing listings before inserting new ones
    await Listing.deleteMany({});

    // Map over the initData data and add the owner field
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "658e87bc96c53ffeef0437ca" }));

    // Iterate through the initData data and upload images to Cloudinary
    const listingsWithCloudinaryImages = await Promise.all(
      initData.data.map(async (listingData) => {
        // Extract the image data from the listingData
        const { image, ...rest } = listingData;

        try {
          // Ensure that `image` is structured as expected
          const imageData = image && image.url ? image.url : null;

          if (!imageData) {
            throw new Error('Image data is missing or invalid.');
          }

          // Use Cloudinary's `upload` function to upload the image directly
          const cloudinaryImage = await cloudinary.uploader.upload(imageData, {
            folder: 'TravelCrafter_DEV',
            allowed_formats: ["png", "jpg", "jpeg"],
          });

          // Create a new listing object with Cloudinary image URL
          const listingWithImage = {
            ...rest,
            image: {
              url: cloudinaryImage.url,
              filename: cloudinaryImage.original_filename,
            },
            owner: process.env.DB_ADMIN_ID,
          };

          return listingWithImage;
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          throw uploadError; // Rethrow the error to propagate it to the outer catch block
        }
      })
    );

    // Insert the listings with Cloudinary images into the database
    let listings = await Listing.insertMany(listingsWithCloudinaryImages);

    console.log("Data was initialized with Cloudinary images");
  } catch (error) {
    console.error('Error in initDB:', error);
  }
};


initDB();

*/
