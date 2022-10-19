import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import RoomEditor from './RoomEditorModal';

function ProfileRoomCard({ fetchUser, info, hostId }) {
  const [editRoomModal, setModal] = useState(false);

  // create function to delete card via delete req and update room list (to be drilled down to Room)
  const deleteRoom = async (id) => {
    const deleted = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    }).then(response => response.json());

    fetchUser();
  };

  async function approvePendingUser(e) {
    console.log('client invoking approvePendingUser');
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
      console.log('user approved')
      fetchUser();

    } catch (err) {
      console.log(err);
    }
  }

  async function denyPendingUser(e) {

    // console.log('e: '. e);
    // console.log('info: ', info);
    try {
      const userId = {
        _id: e._id
      };

      const data = await fetch(`/api/rooms/deny-pending-user/${info._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userId),
      });
      console.log('user denied');
      fetchUser();
    }
    catch(err) {
      console.log(err);
    }
  }


  async function deleteApprovedUser(e) {

    // console.log('e: '. e);
    // console.log('info: ', info);
    try {
      const userId = {
        _id: e._id
      };

      const data = await fetch(`/api/rooms//delete-approved-user/${info._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userId),
      });
      console.log('user deleted');
      fetchUser();
    }
    catch(err) {
      console.log(err);
    }
  }
  

  const closeModal = (event) => {
    event.preventDefault();
    setModal(false);
  };


  function checkIfUserIsHost(e) {
    const userId = e._id;
    console.log('checking if user is host. e._id', userId)
    if (userId === hostId) {
      return true;
    }
    return false;
  }

  const allowedUsers = info.allowedUsers.map((e, i) => {
    console.log('approvedUsers e --> ', e);
    return (
      <div key={`approved-${i}`} style={{marginBottom: 0, marginTop: 0, minHeight: 25}}>
        <span >{e.username}</span>
        { checkIfUserIsHost(e) ? ' (host)' : <Button id="deleteApprovedUser" onClick={() => deleteApprovedUser(e)} sx={{color: '#F15412', paddingTop: 0, paddingBottom: 0, margin: 0}}>Delete</Button>}
      </div>
    );
  });


  // map out pending users with buttons 'approve' and 'deny' 
  const pendingUsers = info.pendingUsers.map((e, i) => {
    console.log('pendingUsers e --> ', e);
    return (
      <div key={i}>
        <span>{e.username}</span>
        {/* <Button id="exitRoomInfo" onClick={showRoomInfo}>Back</Button>
        <Button id="exitRoomInfo" onClick={showRoomInfo}>Back</Button> */}
        <Button id="approvePendingUser" onClick={() => approvePendingUser(e)} sx={{paddingTop: 0, paddingBottom: 0}}>Approve</Button>
        <Button id="denyPendingUser" onClick={() => denyPendingUser(e)} sx={{color: '#F15412', paddingTop: 0, paddingBottom: 0}}>Deny</Button>
      </div>
    );
  });

  return (
    <div className='profile-room'>
      {/* {console.log(info.pendingUsers[0].username)} */}
      <div><label>Subject: </label>{info.subject}</div>
      <div><label>Restricted: </label>{info.restricted ? 'Yes' : 'No'}</div>
      <div style={{paddingTop: 20, paddingBottom: 5}}><label>Allowed users: </label></div>
      {allowedUsers}
      <div style={{marginTop: 25}}><label>Pending users: </label>{info.pendingUsers[0] ? pendingUsers : <div style={{marginTop: 5}}>None</div>}</div>
      <div style={{marginTop: 20}}>
        <Link to='/main/room' state={{ info }}><Button variant='contained' id="open-room-btn" >Open Room</Button></Link>

        <Button variant='outlined' id="edit-room-btn" onClick={() => setModal(true)}>Edit Room</Button>
        <Button id="delete-room-btn" onClick={() => deleteRoom(info._id)}>Delete Room</Button>

        {editRoomModal && <RoomEditor fetchUser={fetchUser} action={'edit'} id={info._id} closeModal={closeModal} />}

      </div>
    </div>
  );
}

export default ProfileRoomCard;