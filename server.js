require("dotenv").config(); 
const express = require('express')
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3020;
const bodyParser = require('body-parser')
const fs = require('fs');
const https = require('https');


// Using CORS
app.use(cors())
// Applying header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Using bodyParser json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.json());




// Роуты
const textsRouter = require('./texts_routes');
app.use('/texts', textsRouter);

const musicRouter = require('./music_routes');
app.use('/music', musicRouter);

const picturesRouter = require('./pictures_routes');
app.use('/pictures', picturesRouter);


// Для функций администратора Firebase 
const serviceAccount = require("./admin_config.json");

const admin = require("firebase-admin");

admin.initializeApp({
  
  credential: admin.credential.applicationDefault(),
  
  databaseURL: "https://mypersonalwebsite-be592-default-rtdb.europe-west1.firebasedatabase.app"
  
});

module.exports = admin

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};


https.createServer(options, app).listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
