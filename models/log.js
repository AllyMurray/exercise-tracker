const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

logSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
