import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// components
import MainNav from '../components/MainNav';
import SubjectNav from '../components/SubjectNav';
import RoomContainer from './RoomContainer';
import Profile from './Profile';
import SettingsContainer from './SettingsContainer';
import SettingsCard from '../components/SettingsCard';
import Login from '../components/Login';
import Room from './Room';

function Dashboard( ) {
  const [subject, setSubject] = useState('');
  const [loggedIn, setLoggedIn] = useState(true);

  // state with id
  const [userID, setUserID] = useState('');


  const verifyLogin = async () => {
    const logged = await fetch('/api/auth/verify').then(response => response.json());
    setLoggedIn(logged);
    console.log(logged);
    setUserID(logged._id);
  };

  // check session if dashboard remounts
  
  useEffect(() => {
    verifyLogin();
  }, []);

  const noSubject = <p id='no-subject' className='warning'>Please select a subject!</p>;
  const yesSubject = <RoomContainer id={loggedIn._id} subject={subject} user={loggedIn.username}/>;

  return (
    <div id='dashboard'>
      {/* {console.log(loggedIn)} */}
      <Routes>
        <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />
        {loggedIn && <Route path="/main/*" element={<>
          <MainNav setSubject={setSubject} setLoggedIn={setLoggedIn} />
          <Routes>
            <Route path='/home' element={
              <div id='main-container'>
                <SubjectNav subject={subject} setSubject={setSubject} />
                {!subject ? noSubject : loggedIn ? yesSubject : noSubject}
              </div>}
            />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<div id='main-container'>
              <SettingsContainer />
              <div id="login-details-container">
                <SettingsCard/>
              </div>
            </div>}/>
            <Route path='/room' element={<Room />} />
          </Routes>
        </>} />}
        <Route path="*" element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
}

export default Dashboard;