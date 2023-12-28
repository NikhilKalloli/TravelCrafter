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
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const PORT = process.env.PORT;

const dbUrl = process.env.ATLAS_DB_URL;

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
    await mongoose.connect(dbUrl);
}

// This is to store the session information on Atlas DB. Previsously it was on localhost
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600 , // This means that the session will be updated in the database only if it has been modified in the last 24 hours.
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE", err);
})

// Cookie is used to store some data on browser so that other pages can access it
const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET, // This is used to access the cookie
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 *1000,  // cookie gets deleted after a week. So after a week user has to login again
        maxAge:  7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    }
};


// http is a stateless protocol, so we use session to store data on server side
// Session is used to store temporary data on server side so that it can be accessed by other pages
// Session is stored in a cookie on browser side
// Session generates a unique id for each user and this is accessed on browser by a signed cookie

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


app.get("/",(req,res)=>{
    res.redirect("/listings");
})

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404 ,"Page not found"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    res.status(statusCode).render("errors/error.ejs",{message});
})

app.listen(PORT,()=>{
    console.log(`App is listening on PORT: http://localhost:${PORT}`);
})