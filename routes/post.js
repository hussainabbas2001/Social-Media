const mongoose = require('mongoose');

let postSchema = mongoose.Schema({
    post: String,
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
})

module.exports = mongoose.model('post', postSchema);