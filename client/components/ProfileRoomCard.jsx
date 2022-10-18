import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import RoomEditor from './RoomEditorModal';

function ProfileRoomCard({ fetchUser, info }) {
  const [editRoomModal, setModal] = useState(false);

  // create function to delete card via delete req and update room list (to be drilled down to Room)
  const deleteRoom = async (id) => {
    const deleted = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    }).then(response => response.json());

    fetchUser();
  };

  async function approvePendingUser(e) {
    console.log('user approved');
    console.log(info);
    // grabbing user id
    try {
      const userId = {
        _id: e._id
      };
      // make fetch request to backend, passing in user id
      const data = await fetch(`/api/rooms/approve/${info._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userId),
      });

    } catch (err) {
      console.log(err);
    }
  }

  async function denyPendingUser() {
    console.log('user denied');
  }

  const closeModal = (event) => {
    event.preventDefault();
    setModal(false);
  };


  const allowedUsers = info.allowedUsers.map((e, i) => {
    console.log('approvedUsers e --> ', e);
    return (
      <div key={`approved-${i}`}>
        <span >{e.username}</span>
      </div>
    );
  });

  
  // map out pending users with buttons 'approve' and 'deny' 
  const pendingUsers = info.pendingUsers.map((e, i) => {
    console.log('pendingUsers e --> ', e);
    return (
      <div key={i}>
        <span >{e.username}</span>
        {/* <Button id="exitRoomInfo" onClick={showRoomInfo}>Back</Button>
        <Button id="exitRoomInfo" onClick={showRoomInfo}>Back</Button> */}
        <Button id="approvePendingUser" onClick={() => approvePendingUser(e)}>Approve</Button>
        <Button id="denyPendingUser" onClick={denyPendingUser}>Deny</Button>
      </div>
    );
  });

  return (
    <div className='profile-room'>
      {/* {console.log(info.pendingUsers[0].username)} */}
      <p><label>Subject: </label>{info.subject}</p>
      <p><label>Restricted: </label>{info.restricted ? 'Yes' : 'No'}</p>
      <div><label>Allowed users: </label>{allowedUsers}</div>
      <div><label>Pending users: </label>{pendingUsers}</div>
      <Link to='/main/room' state={{ info }}><Button variant='contained' id="open-room-btn" >Open Room</Button></Link>

      <Button variant='outlined' id="edit-room-btn" onClick={() => setModal(true)}>Edit Room</Button>
      <Button id="delete-room-btn" onClick={() => deleteRoom(info._id)}>Delete Room</Button>

      {editRoomModal && <RoomEditor fetchUser={fetchUser} action={'edit'} id={info._id} closeModal={closeModal} />}

    </div>
  );
}

export default ProfileRoomCard;