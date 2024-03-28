require("dotenv").config(); 
const express = require('express')
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3020;
const bodyParser = require('body-parser')


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


  // Слушаем заданный порт
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});
