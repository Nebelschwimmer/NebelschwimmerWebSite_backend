const https = require('https');
const sockjs = require('sockjs');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
// Initialize Firebase Admin SDK
const admin = require("firebase-admin");

const serviceAccount = require("./admin_config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mypersonalwebsite-be592-default-rtdb.europe-west1.firebasedatabase.app"
});


const echoServer = sockjs.createServer({ prefix: '/echo' });
echoServer.on('connection', function(connection) {
  connection.on('data', function(data) {
    try {
      const credentials = JSON.parse(data);
      const userUID = credentials.uid;
      if (!userUID) {
        throw new Error
      }
  
      new Promise((resolve, reject) => {
        getAuth().getUser(userUID)
          .then((userRecord) => {
            resolve(userRecord);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .then((userRecord) => {
        const lastRefreshTime = userRecord.metadata.lastRefreshTime
        const userRecordUID = userRecord.uid;
        console.log(userRecordUID)
        connection.write(JSON.stringify({ 
          isOnline: 
          {
            userUID: userRecordUID,
            lastRefreshTime: lastRefreshTime,
            checkOnlineStatus: 'online'
          } 
      }));
      })
    } catch (error) {
      console.error('Error parsing data:', error);
      connection.write(JSON.stringify({ error: 'Invalid data format' }));
    }
  });

  connection.on('close', function() {
    connection.write(JSON.stringify({ isOnline: { checkOnlineStatus: 'User Offline'}}));
  });
});

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};
const httpsServer = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Secure SockJS server is running!\n');
});

echoServer.installHandlers(httpsServer);



httpsServer.listen(4050, '0.0.0.0', () => {
  console.log('Secure SockJS server is running on port 4050');
});
