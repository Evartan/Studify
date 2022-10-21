import { Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ProfileRoomCard from '../components/ProfileRoomCard';
import RoomEditor from './RoomEditorModal';
import SavedRoomCard from './SavedRoomCard';

function RoomManager({ fetchUser, rooms, savedRoomsProps, host }) {
  const [addRoomModal, setModal] = useState(false);
  const [addSavedRoom, setSavedRoom] = useState(false);

  // console.log(fetchUser);
  // console.log(rooms);
  // console.log(savedRoomsProps);

  // useEffect(() => {
  //   async function getUser() {
  //     user = await fetchUser();
  //   }
  //   getUser();
  // }, [addRoomModal, addSavedRoom]);

  const closeModal = (event) => {
    // event.preventDefault();
    setModal(false);
  };

  const roomCards = rooms.map((e, i) => {
    return <ProfileRoomCard hostId={host} info={e} key={i} fetchUser={fetchUser} />;
  });

  const savedRoomCards = savedRoomsProps ? savedRoomsProps.map((e, i) => {
    return <SavedRoomCard id={host} info={e} key={i} fetchUser={fetchUser}/>;
  }) : <div/>;


  const hostedRooms = (
    <div>
      <h2>Hosted Rooms:</h2>
      {!addRoomModal ?
        <button id='open-add-room'
          onClick={() => setModal(true)}
        >+</button>
        : <RoomEditor closeModal={closeModal} fetchUser={fetchUser} action={'add'} />}
      {roomCards}
    </div>
  );

  const savedRooms =  (
    <div>
      <h2>Saved Rooms:</h2>
    </div>
  );

  return (
    <div id='room-manager'>
      <div id='tabs'>
        <button onClick={(()=>{setModal(false); setSavedRoom((prevState) => {return false;});})} id='profile-tab'>Room Manager</button>
        <button onClick={()=>setSavedRoom(true)} id='saved-rooms-tab'>Saved Rooms</button>
      </div>
      {!addSavedRoom ?
        <div className="profile-room-container">
          {hostedRooms}
        </div> : <div className="profile-room-container">
          {savedRooms}
          {savedRoomCards}
        </div>}
    </div>
  );
}

export default RoomManager;