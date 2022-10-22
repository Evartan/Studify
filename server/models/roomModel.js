const mongoose = require('mongoose');
// require("mongoose-type-url");

// const MONGO_URI =
//   "mongodb+srv://scratch:project@scratch-project-cluster.dphri14.mongodb.net/?retryWrites=true&w=majority";

// mongoose
//   .connect(MONGO_URI, {
//     // options for the connect method to parse the URI
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to Mongo DB."))
//   .catch((err) => console.log(err));

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  subject: { type: String, required: true },
  active: { type: Boolean },
  host: { type: Schema.Types.ObjectId, ref: 'User' },
  allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pendingUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  maxallowed: { type: Number, max: 6 },
  restricted: { type: Boolean, required: true },
  documentId: { type: String, default: null },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
