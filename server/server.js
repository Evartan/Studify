const mongoose = require('mongoose');
const path = require('path');
const express = require('express');

const apiRouter = require('./routes/api');

const cors = require('cors');

const app = express();

/////////////////////
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const OAuth2 = google.auth.OAuth2;
const CONFIG = require('./config');
const cookieParser = require('cookie-parser');

const oauth2Client = new OAuth2(CONFIG.oauth2Credentials.client_id, CONFIG.oauth2Credentials.client_secret, CONFIG.oauth2Credentials.redirect_uris[0]);
///////////////////////


// socket.io 

const http = require('http');
const server = http.createServer(app);
// const { Server } = require('socket.io');
// const io = new Server(server);

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    // credentials: true,
  },
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join_room', (data) => {
    console.log('server join_room -->', data);
    socket.join(data);
  });

  socket.on('send_message', (data) => {
    // console.log(data);
    socket.broadcast.to(data.room).emit('receive_message', data);
    // io.to(data.room).emit('receive_message', data);
  });
});


// require("mongoose-type-url");

const PORT = 3000;

const MONGO_URI =
  'mongodb+srv://teentitans:vrdrK8aFTY3mUGmf@teentitanscluster.u4m5naw.mongodb.net/?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI, {
    // options for the connect method to parse the URI
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to Mongo DB.'))
  .catch((err) => console.log(err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

///////////////////////
app.use(cookieParser());
//////////////////////


// placeholder route for production 
// app.use('/build', express.static(path.join(__dirname, '../build')));

// placeholder route for serving app 
app.use('/', express.static(path.resolve(__dirname, '../build')));



app.get('/auth', (req, res) => {

  const loginLink = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: CONFIG.oauth2Credentials.scopes,
    include_granted_scopes: true
  });
  // console.log(loginLink);
  return res.status(200).json(loginLink);
});

app.get('/auth_callback', async (req, res, next) => {
  try {

    console.log('auth callback was called')

    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);

    const jwt_token = jwt.sign(tokens.refresh_token, CONFIG.JWTsecret);
    // store on cookie
    res.cookie('O_AUTH', jwt_token, {httpOnly: true});
    res.cookie('O_AUTH_PLAIN', tokens.refresh_token);

    return res.redirect('http://localhost:8080/main/room');

    // return res.redirect('/access_drive');

  } catch (e) {
    console.log(e.message);
    return (next);
  }
});


app.get('/access_drive', async (req, res, next) => {
  console.log('access drive');
  const jwt_token = req.cookies.O_AUTH;
  // if no jwt found, return false to frontend
  if (!jwt_token) {
    console.log('no token');
    return res.status(200).json(false);
  }
  const decoded = jwt.verify(jwt_token, CONFIG.JWTsecret);
  
  const drive = google.drive('v3');
  let response;
  const fileArray = [];
  try {
    response = await drive.files.list({
      auth: oauth2Client,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)'
    });
    if (response.data.files.length) {
      response.data.files.forEach(e => { fileArray.push({id: e.id, name: e.name}); });
    } else { return res.status(400).json('There were no documents found on this drive'); }
    return res.status(200).json(fileArray);

  } catch (e) {
    console.log('Error from API:', e.message);
  }

});

app.get('/get_doc', async (req, res) => {

  const documentId = req.query.documentId;

  const docs = google.docs({ version: 'v1', auth: oauth2Client });

  const docData = await docs.documents.get({
    documentId: documentId
  });

  res.status(200).json(docData.data);

});


app.use('/api', apiRouter);

app.use((req, res) =>
  res.status(404).send('Page not found')
);

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});



server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
}); //listens on port 3000 -> http://localhost:3000/
