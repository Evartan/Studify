import { Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function RoomCard( { info, id, user, verifyLogin } ) {
  // console.log('roomCard component info:', info)
  // console.log('roomCard component id:', id)
  // console.log('roomCard component verifyLogin:', verifyLogin)

  // const [userID, setUserID] = useState(id);

  const [roomInfoBoolean, setRoomInfoBoolean] = useState(false);
  const [saved, setSaved] = useState(false);
  const [joinRoom, setJoinRoom] = useState();

  // const textOnSubmit = event => {
  //   event.preventDefault();
  //   setName((prevName) => {return newName})
  // }

  // function handleChange() {
  //   newName = event.target.value
  //   return event.target.value
  // }

  async function saveRoom () {
    const options = {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({'savedRooms': `${info._id}`})};
    await fetch('/api/users/saveroom', options);
    // console.log('Room Saved!');
    setSaved(true);
  }

  const showRoomInfo = event => {
    setRoomInfoBoolean(!roomInfoBoolean);
  };

  //verify access to a given room
  const verifyAccess = () => {
    const allowedUsersIds = [];

    for (let i = 0; i < info.allowedUsers.length; i++) {
      allowedUsersIds.push(info.allowedUsers[i]._id);
    }
    // console.log('allowedUsersIds array', allowedUsersIds)

    if(!info.restricted){
      setJoinRoom(<Link to='/main/room' state={{ info }}><Button variant='contained'>Join Room</Button></Link>);
    }
    else if(info.restricted && allowedUsersIds.includes(id)){
      setJoinRoom(<Link to='/main/room' state={{ info }}><Button variant='contained'>Join Room</Button></Link>);  
    }
    else if(info.pendingUsers.includes(id)){
      setJoinRoom(<Button variant='contained'>Access Requested</Button>);
    }
    else{
      setJoinRoom(<Button variant='contained' onClick={onClick}>Request Access</Button>);
    }
  };
  
  const onClick = async event => {
    const pendingUserUrl = '/api/rooms/add-pending-user/' + info._id;
    const options = {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({'_id': `${id}`})};
    await fetch(pendingUserUrl, options);
    setJoinRoom(<Button variant='contained'>Access Requested</Button>);
  };

  useEffect(() => {
    verifyAccess();
    if(!id){
      verifyLogin();
    }
  }, [id]);

  const mainRoom = (
    <div className="mainRoom" onClick={showRoomInfo}>
      {/* <div > */}
      {/* <div>
          <img src='https://csunshinetoday.csun.edu/wp-content/uploads/Math4-web.jpg' width="192" height="144"/>
        </div> */}
      {info.host.nickname} Room
      {/* <InfoIcon fontSize="small" onClick={showRoomInfo}></InfoIcon> */}
      {/* </div> */}
      {/* <form>
        <input id="nameInput" type="text" placeholder="Your Name Here" onChange={handleChange}></input>
        <button id="onSubmitButton" onClick={textOnSubmit}>Enter</button>
        <button id="showRoomInfo" onClick={showRoomInfo}>Show Room Info</button>
      </form> */}
    </div>
  );

  const allowedUsers = info.allowedUsers.map((e, i) => {
    // console.log('approvedUsers e --> ', e);
    return (
      <span key={`approved-${i}`} style={{fontWeight: 'normal', paddingRight: 8, paddingBottom: 0}} >{e.username}</span>
    );
  });

  const roomInfo = (
    <div className="roomInfo">
      <p style={{paddingTop: 4}}><span style={{paddingRight: 4}}>Subject:  </span><span style={{fontWeight: 'normal'}}>{info.subject.toUpperCase()}</span> </p>
      <p style={{paddingTop: 10}}><span style={{paddingRight: 4}}>Creator:  </span><span style={{fontWeight: 'normal'}}>{info.host.username}</span> </p>
      <p style={{paddingTop: 10}}><span style={{paddingRight: 4}}>People Inside: </span>{allowedUsers}</p>
      {/* {allowedUsers}  */}
      <p style={{paddingTop: 10, paddingBottom: 12}}><span style={{paddingRight: 4}}>Restricted: </span>{info.restricted ? 'Yes' : 'No'} </p>
      <div id='main-button'>
        {joinRoom}
        {!saved && <Button variant='contained' id="saveMyRoom" onClick={saveRoom}>Save</Button>}
        {saved && <Button variant='outlined' id="saveMyRoom">Saved!</Button>}
        <Button id="exitRoomInfo" onClick={showRoomInfo}>Back</Button>
      </div>
    </div>
  );

  if (!roomInfoBoolean) {
    return mainRoom;
  } else if (roomInfoBoolean) {
    return roomInfo;
  }
}

export default RoomCard;