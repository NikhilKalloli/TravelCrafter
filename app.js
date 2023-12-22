if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env)



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path =require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

const sessionOptions = {
    secret:"mysecret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 *1000,  // cookie deletes after a week
        maxAge:  7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    }
};

// app.get("/", (req,res)=>{
//     res.send("Home page");
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// Middleware for flash messages
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"Harry",
//     })

//     let registeredUser = await User.register(fakeUser,"Helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

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