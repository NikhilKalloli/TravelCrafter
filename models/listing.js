const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: String,
    image: {
        url:String,
        filename:String,
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
       type: {
            type: String, 
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    category:{
            type:String,
            enum:[ "Trending" , "Rooms", "Iconic cities", "Mountains", "Castles" , "Amazing pools", "Camping", "Farms", "Arctic", "Beaches", "Boats" ],
            required:true
        }
})



// The below code is for deleting reviews when a listing is deleted
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;