const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"]
  }
});

const User = mongoose.model('user', userSchema);


module.exports = User;