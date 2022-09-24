const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/apptest');

let userSchema = mongoose.Schema({
  name: String,
  usename: String,
  password: String,
  post: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }],
})

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);