import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import { io } from 'socket.io-client';
import { useCookies } from 'react-cookie';
import jwt_decode from 'jwt-decode';

const socket = io('http://localhost:3000');

function Chatbox(props) {
  const { info } = props;
  // console.log('info --> ', info);

  const [cookies, setCookie] = useCookies();

  const [username, setUsername] = useState('');

  const [message, setMessage] = useState('');
  const [messageReceived, setMessageReceived] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  // message history is array of objects consisting of message body property and received which is boolean to
  // indicate if message was received or sent
  const [messageHistory, setMessageHistory] = useState([]);

  const getChatHistory = async () => {
    const messages = await fetch(`/api/rooms/chats/${info._id}`);
    const msgResponse = await messages.json();
    setMessageHistory(msgResponse);
  };

  const sendMessage = () => {
    // emit event to server
    // console.log('msgObj roomId -->', cookies.roomId)
    const decoded = jwt_decode(cookies.ssid);
    // console.log('jwt decoded', decoded);

    const messageObj = { message, room: props.room, user: decoded._id, username };
    console.log('sendMessage messageObj --> ', messageObj);
    socket.emit('send_message', messageObj);

    // append message object as document in chat collection
    addMessage(messageObj);
  };

  const addMessage = async (messageObj) => {
    console.log('inside chatbox addMessage helper fx');
    const messages = await fetch('/api/rooms/chats', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(messageObj),
    });

    const response = await messages.json();
    console.log('addMessage response --> ', response);

    getChatHistory();
  };

  useEffect(() => {
    if (messageHistory.length === 0) {
      getChatHistory();
    }
  });

  // separate useEffect to join room chat on component render
  useEffect(() => {
    console.log("chatbox useeffect");
    // get the user info off jwt cookie
    const decoded = jwt_decode(cookies.ssid);
    setUsername(decoded.username);
    socket.emit("join_room", props.room);
  }, [cookies.ssid, props.room]);


  // useEffect listening to socket events containing socket listener for received messeages events to append to message history
  useEffect(() => {
    console.log('rec message use effect runs')
    socket.on('receive_message', (data) => {
      setMessageHistory((state) => {
        const newHistory = [...state, data];
        return newHistory;
      });
    });
  }, [socket]);


  const messages = messageHistory.map((e, i) => {
    // console.log('messages e --> ', e);

    if (e.username === username) {
      const rightStyle = {
        color: '#1976d2',
        textAlign: 'right',
        backgroundColor: '#ededed',
        padding: '8px',
        marginBottom: '5px',
      };
      return (
        <div key={i} style={rightStyle} className="chatbox-msg">
          <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{e.username}</p>
          <p style={{ color: 'grey' }}>{e.message}</p>
        </div>
      );
    } else {
      const leftStyle = {
        color: '#1976d2',
        textAlign: 'left',
        backgroundColor: '#ededed',
        padding: '8px',
        marginBottom: '5px',
      };
      return (
        <div key={i} style={leftStyle} className="chatbox-msg">
          <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{e.username}</p>
          <p style={{ color: 'grey' }}>{e.message}</p>
        </div>
      );
    }
  });

  return (
    <div className="chatbox">
      <div id="message-container">
        <h3>Room Chat</h3>
        <div id="message-container-inner">
          {messages}
          {/* <div ref={last} /> */}
        </div>
      </div>
      <div id="chatbox-input">
        <form>
          <input
            type="text"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          ></input>
          <Button
            id="chatbox-input-button"
            variant="text"
            onClick={sendMessage}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Chatbox;
