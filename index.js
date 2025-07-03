const express = require("express")
const app = express()

const path =require("path")
const mongoose = require('mongoose')

const Blog = require('./models/blog') // to route requests
const userRoute = require('./routes/user');
const blogRoute = require("./routes/blog")

const cookieParser =  require('cookie-parser');


const PORT = 8000;


app.use(express.static(path.resolve('./public')))

const { checkForAuthenticationCookie } = require("./middlewares.js/authentication");


mongoose.connect('mongodb://0.0.0.0:27017/blogify').then(e => console.log('mongo DB is connected')) // connecting DB


app.set("view engine","ejs");
app.set("views",path.resolve("./views"));



// to handle form data of user signup
app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))



app.get('/',async(req,res)=>{

    const allBlogs = await Blog.find({});

    res.render("home",{
        user : req.user,
        blogs:allBlogs,
    })
 
})
app.use("/user",userRoute) //for user relate request

app.use("/blog",blogRoute) // for blog requests



app.listen(PORT,()=>console.log(`Server Started at:${PORT}`));
