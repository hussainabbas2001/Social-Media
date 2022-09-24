var express = require('express');
var router = express.Router();

var passport = require('passport');
var passportlocal = require('passport-local');
var userDb = require('./users');
var postDb = require('./post');
const { populate } = require('./users');
passport.use(new passportlocal(userDb.authenticate()));

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/')
  }
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post("/register", function(req, res){
  let newUser = new userDb({
    name: req.body.name,
    username: req.body.username
  })
  userDb.register(newUser, req.body.password)
  .then(function(u){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/")
    })
  })
  .catch(function(error){
    res.send(error)
  })
});

router.post("/login", passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/"
}))

router.get("/profile",isLoggedIn, function(req, res){
  userDb.findOne({username: req.session.passport.user})
  .populate('post')
  .then(function(foundUser){
    res.render('profile', {userData: foundUser})
  })
})

router.get('/logout', isLoggedIn, function(req, res){
  req.logOut();
  res.redirect('/')
})

router.post("/poste", isLoggedIn, function(req, res){
  postDb.create({
    post: req.body.postData
  })
  .then(function(postCreated){
    userDb.findOne({username: req.session.passport.user})
    .then(function(foundUser){
      foundUser.post.push(postCreated._id)
      foundUser.save()
      .then(function(){
        res.redirect("/profile")
      })
    })
  })
})

router.get("/like/:id", isLoggedIn, function(req, res){
  postDb.findOne({
    _id: req.params.id
  })
  .then(function(postCreated){
    userDb.findOne({username: req.session.passport.user})
    .then(function(foundUser){
      if(postCreated.likes.indexOf(foundUser._id) == -1){
        postCreated.likes.push(foundUser._id)
      }else{
        postCreated.likes.splice(postCreated.likes.indexOf(foundUser._id),1 )
      }
      postCreated.save()
      .then(function(){
        res.redirect("/profile")
      })
    })
  })
})

router.get("/delete/:id", isLoggedIn, function(req, res){
  postDb.findOneAndDelete({
    _id: req.params.id
  })
  .then(function(postDeleted){
    res.redirect("/profile")
  })
})


router.get("/feed", function(req, res){
  userDb.findOne({username: req.session.passport.user})
  .populate('post')
  .then(function(ALLpost){
    res.render('feed', {ALLpost})
  })
})

module.exports = router;
