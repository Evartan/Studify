import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Chatbox from '../components/Chatbox';
import DocumentEditor from '../components/DocumentEditor';

function Room() {

  const [hostInfo, setHost] = useState({});
  const [hostView, setHostView] = useState(false);
  const [info, setInfo] = useState({});

  const [messageHistory, setMessageHistory] = useState([]);

  const state = useLocation().state;

  // save roomdoc in cookie for retrieval after redirect
  const saveRoom = async () => {
    // console.log('saving room');
    const saved = await fetch('/api/rooms/cookie', {
      method: 'POST',
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ room: info._id }),
    }).then((response) => response.json());
    // console.log(saved);
  };

  const getRoom = async () => {
    console.log("getting room");
    const room = await fetch("/api/rooms/cookie").then((response) =>
      response.json()
    );
    console.log(room);
    setInfo(room);
  };

  // fetch host if info doesn't already exist
  const fetchHost = async () => {
    const details = await fetch("/api/users").then((response) =>
      response.json()
    );
    setHost(details);
    // if room host is the same as the current user
    if (!info.host._id || info.host._id === details._id) setHostView(true);
  };

  // update room info
  useEffect(() => {
    // console.log('useEffect 1 runs')
    // if state exists then set info
    if (state) setInfo(state.info);
    // console.log('state', state)
    // if info is null (no state) then retrieve room info
    if (!state) getRoom();
  }, [hostView]);

  // set host and set cookie for room
  useEffect(() => {
    // console.log('useEffect 2 runs');
    if (info.host) fetchHost();
    // console.log('info', info)
    // if info was read from state then save id
    if (state) saveRoom();
    // console.log('hostview', hostView);
  }, [info]);

  return (
    <div className="room-page">
      <div id="room-page-info">
        <h2>Host: {info.host && (info.host.nickname || hostInfo.nickname)} </h2>
        <h2>Subject: {info.subject}</h2>
      </div>
      <DocumentEditor hostView={hostView} roomInfo={info}/>
      <Chatbox room={state.info._id} info={info} />
    </div>
  );
}

export default Room;