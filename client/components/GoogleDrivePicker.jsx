import React, { useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { Button } from '@mui/material';
import { oauth2Credentials } from '../../server/config';
import { useCookies } from 'react-cookie';
import jwt_decode from 'jwt-decode';

function GoogleDrivePicker({ setDocument, roomInfo }) {
  const [openPicker, authResponse] = useDrivePicker();

  const [cookies, setCookie, removeCookie] = useCookies(['O_AUTH_PLAIN']);

  // console.log(cookies.O_AUTH_PLAIN);

  const handleOpenPicker = () => {
    openPicker({
      clientId: oauth2Credentials.client_id,
      developerKey: oauth2Credentials.developer_key, // insert api_key
      viewId: 'DOCS',
      token: cookies.O_AUTH_PLAIN,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: async (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button');
        }
        console.log('data', data);
        const url = data.docs[0].url;
        const sharedURL = url.replace('drive_web', 'sharing');

        // making patch request to room document
        await fetch(`/api/rooms/updateDoc/${roomInfo._id}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ documentId: sharedURL }),
        });

        setDocument(sharedURL);
        console.log('data.docs.url', sharedURL);
      }
    });
  };

  return (
    <div>
      <Button variant="contained" id="google-drive-picker-btn" onClick={() => handleOpenPicker()}>Open Picker</Button>
    </div>
  );

}

export default GoogleDrivePicker;

