const { Schema, model } = require('mongoose');

const urlSchema = new Schema({
  shortid: {
    type: String,
    required: true,
    unique: true,
  },
  redirecturl: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
}, { timestamps: true });

const Url = model('url', urlSchema);

module.exports = Url;
