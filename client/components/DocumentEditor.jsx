import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FilePicker from './FilePicker';
import GoogleDrivePicker from './GoogleDrivePicker';

function DocumentEditor({ hostView }) {
  // some fake data for rendering purposes
  const fakeFileList = ['test1', 'someDocument', 'my story'];

  const [openPicker, setPicker] = useState(false);
  const [fileList, setFiles] = useState(fakeFileList);
  const [document, setDocument] = useState({});

  const connectAuth = async () => {
    console.log('click auth');
    // first check to see if token is already in cookies
    const files = await fetch('/access_drive').then(response => response.json());

    if (files) {
      // console.log(files);
      setPicker(true);
      return setFiles(files);
    }
    // console.log('not authorized yet');
    // request oauth url from server
    const redirectURL = await fetch('/auth').then(response => response.json());
    // redirect user to consent screen
    window.location.replace(redirectURL);
    // redirect should come back as an array with the files
    setFiles(await fetch('/access_drive').then(response => response.json()));
    setPicker(true);
  };


  return (
    <div className='doc-editor'>
      <h3>Document Upload</h3>
      {openPicker && <FilePicker fileList={fileList} setDocument={setDocument} />}
      {hostView && !openPicker && <Button onClick={() => connectAuth()}>Choose a Google Drive File</Button>}
      <GoogleDrivePicker />
    </div>
  );
}

export default DocumentEditor;