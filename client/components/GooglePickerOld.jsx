/* THIS COMPONENT NOT IN USE!!

the component below was refactored into react from the code sample shown in the google picker api docs.
https://developers.google.com/drive/picker/guides/sample
the component mounts, laods scripts, and renders as expected.
when clicking AUTHORIZE, the OAUTH consent screen will appear with the requested permissions.
however, the cookies sent by google to enable the picker view after sign in, are not secure.
(the error will appear in the browser console)
this results in a sign-in loop and eventually terminates into a 400 bad request.
after much research a fix was not found.
-- pchu 10-07-2022

*/

/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

function GooglePicker() {
  const [authBtn, setAuthVisible] = useState(false);
  const [signoutBtn, setSignVisible] = useState(false);
  const [pickerView, setPickerView] = useState(false);
  // google api states
  const [tokenClient, setTokenClient] = useState({});

  const SCOPES = 'https://www.googleapis.com/auth/drive \ https://www.googleapis.com/auth/documents';
  const CLIENT_ID = '609389573912-4edqp4q82jt67rncqeeq0504o482vdkp.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyB2lcoxtPxVAJiyYM8fcLlq2kefgUB91lE';
  const APP_ID = 'artful-zone-364600';

  // load scripts
  useEffect(() => {
    // console.log('mounting scripts');
    const script1 = document.createElement('script');
    const script2 = document.createElement('script');
  
    script1.src = 'https://apis.google.com/js/api.js';
    script1.async = true;
    script1.onload = gapiLoaded;

    script2.src = 'https://accounts.google.com/gsi/client';
    script2.async = true;
    script2.onload = gisLoaded;

  
    document.body.appendChild(script1);
    document.body.appendChild(script2);
    console.log('scripts mounted');
  
    // return () => {
    //   document.body.removeChild(script1);
    //   document.body.removeChild(script2);
    // };
  }, []);

  let accessToken = null;
  let pickerInited = false;
  let gisInited = false;

  /**
   * Callback after api.js is loaded.
   */
  const gapiLoaded = () => {
    gapi.load('client:picker', intializePicker);
    console.log('gapi loaded');
  };
  /**
   * Callback after Google Identity Services are loaded.
   */
  const gisLoaded = () => {
    const newTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    setTokenClient(newTokenClient);
    gisInited = true;
    maybeEnableButtons();
    console.log(newTokenClient, 'gis loaded');
  };
  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  const intializePicker = async () => {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    pickerInited = true;
    console.log('initialized picker');
    maybeEnableButtons();
  };

  /**
   * Enables user interaction after all libraries are loaded.
   */
  const maybeEnableButtons = () => {
    if (pickerInited && gisInited) {
      setAuthVisible(true);
      console.log('buttons enabled');
    }
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = () => {

    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        throw (response);
      }
      accessToken = response.access_token;
      setSignVisible(true);
      // change auth btn text to 'refresh'
      await setPickerView(true);
    };
    console.log('auth clicked', tokenClient);

    if (accessToken === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignoutClick = () => {
    if (accessToken) {
      accessToken = null;
      google.accounts.oauth2.revoke(accessToken);
      // change auth btn text back to 'auth'
      setSignVisible(false);
    }
  };

  const pickerCallback = async(data) => {
    if (data.action === google.picker.Action.PICKED) {
      let text = `Picker response: \n${JSON.stringify(data, null, 2)}\n`;
      const document = data[google.picker.Response.DOCUMENTS][0];
      const fileId = document[google.picker.Document.ID];
      console.log(fileId);
      const res = await gapi.client.drive.files.get({
        'fileId': fileId,
        'fields': '*',
      });
      text += `Drive API response for first document: \n${JSON.stringify(res.result, null, 2)}\n`;
      console.log(text);

    }

  };
  return (
    <div className='google-picker'>
      {pickerView && <Picker API_KEY={API_KEY} APP_ID={APP_ID} accessToken={accessToken} pickerCallback={pickerCallback} />}
      {authBtn && <Button variant='contained' id='google-picker-btn' onClick={handleAuthClick}>Authorize</Button>}
      {signoutBtn && <Button variant='text' id='google-picker-btn' onClick={handleSignoutClick}>Sign Out</Button>}
    </div>
  );
}
/**
   *  Create and render a Picker object for searching images.
   */
  
function Picker ({ API_KEY, APP_ID, accessToken, pickerCallback }) {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes('image/png,image/jpeg,image/jpg');
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .setDeveloperKey(API_KEY)
    .setAppId(APP_ID)
    .setOAuthToken(accessToken)
    .addView(view)
    .addView(new google.picker.DocsUploadView())
    .setCallback(pickerCallback)
    .setRelayUrl(window.location.host)
    .build();
  picker.setVisible(true);

  return (
    <div id='picker-wrapper'>
    </div>
  );
}
  
export default GooglePicker;