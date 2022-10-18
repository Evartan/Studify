const express = require('express');
const router = express.Router();

const roomsController = require('../controllers/roomsController');
const cookieController = require('../controllers/cookieController');



// router.get('/',
//   cookieController.getRoomCookie,
//   roomsController.getRoom,
//   (req, res) => res.status(200).json(res.locals.room)
// );

router.post('/',
  cookieController.verifyUser,
  roomsController.openNewRoom,
  (req, res) => res.status(200).json(res.locals.newRoom)
);

router.delete('/:id',
  roomsController.deleteRoom,
  (req, res) => res.status(200).json(res.locals.deletedRoom)
);

router.get('/user/:id',
  roomsController.getUserRooms,
  (req, res) => res.status(200).json(res.locals.userRooms)
);

router.patch('/update/:id',
  roomsController.updateRoom,
  (req, res) => res.status(200).json({ message: 'Updated the Room info.' })
);

router.get('/cookie',
  cookieController.getRoomCookie,
  roomsController.getRoom,
  (req, res) => res.status(200).json(res.locals.roomDoc)
);

router.post('/cookie',
  cookieController.setRoomCookie,
  (req, res) => res.status(200).json('set room cookie!')
);

router.get('/:subject',
  roomsController.getAllRooms,
  (req, res) => res.status(200).json(res.locals.roomslist)
);

// route to approve pending user
router.patch('/approve/:room_id',
  roomsController.approveUser,
  (req, res) => res.status(204).end()
);

// route to get chat history for a room
router.get('/chats/:room_id',
  roomsController.getChatHistory,
  (req, res) => res.status(200).json(res.locals.chatHistory)
);

router.patch('/add-pending-user/:room_id', roomsController.addPendingUser, (req, res) => {
  res.status(200).json('adding pending user');
});



module.exports = router;