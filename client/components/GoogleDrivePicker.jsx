import React, { useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { Button } from '@mui/material';
import '../../server/config';

function GoogleDrivePicker() {
  const [openPicker, authResponse] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId: '', // insert clientID from config.js - move this functionality to backend?
      developerKey: '', // insert api_key
      viewId: 'DOCS',
      // token: '', // pass oauth token
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data);
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

