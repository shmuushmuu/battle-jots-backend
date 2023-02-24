const { Schema, model } = require('mongoose');

const requestSchema = new Schema({
  requestor: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: Number,
    default: 0,
    required: true
  }

});

const Request = model('request', requestSchema);

module.exports = Request;