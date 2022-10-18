const { findById, findByIdAndUpdate } = require('../models/roomModel');
const room = require('../models/roomModel');
const user = require('../models/userModel');
const chat = require('../models/chatModel');

const roomsController = {};

roomsController.getAllRooms = async (req, res, next) => {
  let roomslist;
  const { subject } = req.params;
  try {

    roomslist = await room.find({ subject: subject }).where('active').equals(true).populate('host');
    // console.log(roomslist);
    res.locals.roomslist = roomslist;

  } catch (e) {
    console.log(e.message);
  }

  if (roomslist.length === 0) {
    res.locals.roomslist = 'There are no active rooms for this subject';
  }
  next();

};

roomsController.getRoom = async (req, res, next) => {
  try {
    // console.log('getRoom id', res.locals.roomId)
    const roomDoc = await room.findById(res.locals.roomId);
    // console.log('roomdoc', roomDoc);
    res.locals.roomDoc = roomDoc;
    return next();
  } catch (err) {
    return next(err);
  }
};

roomsController.openNewRoom = async (req, res, next) => {
  const { _id: host } = res.locals.token;
  const { subject, restricted, allowedUsers, active } = req.body;
  let newRoom;
  try {
    newRoom = await room.create({
      host, subject, restricted,
      allowedUsers: [host], active
    });
    // add new room to host user's rooms list
    const hostUser = await user.findById(host);
    hostUser.rooms.push(newRoom._id);
    await hostUser.save();

    console.log('newRoom', newRoom)
    res.locals.newRoom = newRoom;

  } catch (e) {
    console.log(e.message);
  }

  if (!newRoom) {
    return res.status(404).json({ message: 'No new room was created' });
  }
  next();

};

roomsController.getUserRooms = async (req, res, next) => {
  const { user_id } = req.params;
  let rooms;
  try {
    rooms = await room.find({ host: user_id });
    res.locals.userRooms = rooms;
  } catch (e) {
    console.log(e.message);
  }

  if (rooms.length === 0) {
    return res.status(404).json({ message: 'There are no rooms associated to this user ID' });
  }

  next();

};

roomsController.deleteRoom = async (req, res, next) => {
  const { id } = req.params;

  let roomDelete;
  try {

    roomDelete = await room.findOneAndDelete({ _id: id });
    res.locals.deletedRoom = roomDelete;
    // updated host users rooms list

    const removedFromUser = await user.findOneAndUpdate({ _id: roomDelete.host },
      { $pull: { rows: id } },
      { new: true });

  } catch (e) {
    console.log(e.message);
  }

  if (!roomDelete) {
    return res.status(404).json({ message: 'Unable to find the room to delete' });
  }
  next();
};


roomsController.updateRoom = async (req, res, next) => {
  const { id } = req.params;
  const { subject, restricted, maxallowed, allowedUsers } = req.body;
  let updatedRoom;
  try {

    updatedRoom = await room.findByIdAndUpdate(id, { subject, restricted, maxallowed, allowedUsers });
    res.locals.updatedRoom = updatedRoom;
  } catch (e) {
    console.log(e.message);
  }

  if (!updatedRoom) {
    return res.status(404).json({ message: 'Unable to find the room' });
  }

  next();
};


roomsController.addPendingUser = async (req, res, next) => {
  const roomID = req.params.room_id;
  const userID = req.body._id;

  try {
    const currentRoom = await room.findById(roomID).exec();
    // console.log(currentRoom);
    if (currentRoom.pendingUsers.includes(userID)) {
      throw new Error('user already in pending users');
    } else {
      await room.updateOne({ _id: roomID }, { $push: { pendingUsers: userID } }).exec();
      console.log('inside addPendingUser controller');
      return next();
    }
  } catch(err) {
    // console.log('Error in roomsController.addPendingUser: ', err.message);
    return next({
      log: `Error in roomsController.addPendingUser. ${err}`,
      message: `${err}`
    });
  }
};


roomsController.approveUser = async (req, res, next) => {

  // get room ID from params
  const roomID = req.params.room_id;

  // get user id from req body
  const userID = req.body._id;

  // put user into approved user array
  try {
    await room.updateOne({ _id: roomID }, { $pull: { pendingUsers: userID } });

    await room.updateOne({ _id: roomID }, { $push: { allowedUsers: userID } });

    return next();

  } catch (e) {
    console.log(e.message);
  }
};


roomsController.getChatHistory = async (req, res, next) => {
  const roomID = req.params.room_id;
  let chatHistory;
  try {
    chatHistory = await chat.find({ room: roomID });
    res.locals.chatHistory = chatHistory;
  } catch (e) {
    console.log(e.message);
  }
};


roomsController.denyPendingUserRequest = async (req, res, next) => {
  const roomID = req.params.room_id;
  const userID = req.body._id;

  try {
    await room.updateOne({ _id: roomID }, { $pull: { pendingUsers: userID } });
    console.log('denyPendingUserRequest controller')
    return next();
  }
  catch(err) {
    return next({
      log: `Error in roomsController.denyPendingUser. ${err}`,
      message: `${err}`
    });
  }
}

roomsController.deleteApprovedUser = async (req, res, next) => {
  const roomID = req.params.room_id;
  const userID = req.body._id;

  try {
    await room.updateOne({ _id: roomID}, { $pull: { allowedUsers: userID }});
    return next();
  }
  catch(err) {
    return next({
      log: `Error in roomsController.deleteApprovedUser. ${err}`,
      message: `${err}`
    });  
  }
}



module.exports = roomsController;