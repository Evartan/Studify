const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  username: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room'},
  message: { type: String, required: true},
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;