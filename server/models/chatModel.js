const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  username: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room'},
  message: { type: String, required: true},
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;