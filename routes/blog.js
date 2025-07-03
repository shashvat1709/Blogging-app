const { Router } = require("express");
const multer = require("multer");
const path = require('path')

const Blog = require("../models/blog");

const Comment = require("../models/comment");

const express = require("express");

const app = express();

const router = Router();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.resolve(`./public/uploads/`));
    },
    filename:function(req,file,cb){
       const fileName = `${Date.now()}-${file.originalname}`;
       cb(null,fileName)

    
    }
});

const upload = multer({storage:storage});


router.get("/add-new",(req,res)=>{
    return res.render("addBlog",{

        user: req.user,
    });
})

router.post('/comment/:blogId',async(req,res)=>{
      await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,

    });
    return res.redirect(`/blog/${req.params.blogId}`);
})


router.get("/:id", async (req,res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy");
     const comments  =  await Comment.find({ blogId : req.params.id}).populate("createdBy");
     console.log(comments)
    return res.render("blog",{
        user:req.user,
        blog,
         comments,
    });

})

router.post("/",upload.single("coverImage"),async(req,res)=>{
  
    const {title,body} = req.body
    const blog = await Blog.create({

        body,
        title,
        createdBy:req.user._id,
        coverImageURL:`/uploads/${req.file.filename}`
    })

    console.log(blog.createdBy)
  
    return res.redirect("/")

})

module.exports = router;