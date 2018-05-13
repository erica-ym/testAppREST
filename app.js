var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer")

var app = express();
mongoose.connect("mongodb://localhost:27017/testApp");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method")); //the cheat to allow different methods
app.use(expressSanitizer());

//mongoose model setup
var blogSchema = new mongoose.Schema( {
    title: String,
    image: String,
    body: String,
    created:
        {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);
/*
Blog.create( {
    title: "This is my first blog post!",
    image: "http://image.boomsbeat.com/data/images/full/43871/windows-xp-background-image-jpg.jpg",
    body: "Windows XP was my childhood and my first introduction to computers, so it seems fitting for this post. "
})
*/

//RESTful routes start here
//New Route - GET - Shows a new form
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//Index Route - GET
app.get("/blogs", function(req,res){
    Blog.find({}, function(err, blogs){ //pass in error and data variables
        if(err) {
            console.log(err);
        } else {
           res.render("index", {blogs:blogs});
        }
    });
});

//Show Route - GET - Show all info about one ID
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err,foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog:foundBlog});
        }
    } )
})

//Create route - POST - Create a new item, then redirect
app.post("/blogs", function(req,res){
    //create blog
    //redirect to index
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            console.log(err);
            res.render("new")
        } else {
            res.redirect("/blogs");
        }
    });
});

//Edit Route - GET - Shows an edit form
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err,foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog:foundBlog});
        }
    } )
});

//Update Route - PUT - Update item, then redirect - paired with edit
app.put("/blogs/:id", function(req,res){
    //takes an id, data, and callback function
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog , function(err, updatedBlog) { //blog is whatever we called the data in the updated form
        if(err) {
            res.redirect("/blogs");
        }  else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
})

//Destroy route - DELETE - Delete item
app.delete("/blogs/:id", function(req,res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            //redirect somewhere
            res.redirect("blogs");
        }
    })
})

//Root index that sends you to /blogs if you type something wrong
app.get("/", function(req,res) {
    res.redirect("/blogs");
})

app.listen(8000,function() {
    console.log("Blog server is running on port 8000!");
});
