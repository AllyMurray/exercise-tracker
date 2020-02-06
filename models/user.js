const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  }
});

userSchema
  .set('toJSON', {
    transform: (document, returnedObject) => {
      delete returnedObject.__v;
    }
  })
  .plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports = User;
