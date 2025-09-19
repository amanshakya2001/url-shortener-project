const { Schema, model } = require('mongoose');

const urlSchema = new Schema({
  shortid: {
    type: String,
    require: true
  },
  redirecturl: {
    type: String,
    require: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user"
  }
});

const Url = model('url', urlSchema);

module.exports = Url;