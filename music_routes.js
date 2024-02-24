const express = require('express')
const music = express.Router()
const bodyParser = require('body-parser')
// music.use(express.json());
const fileupload = require('express-fileupload');
const path = require('path');

const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );


music.use(bodyParser.json());
music.use(bodyParser.urlencoded({ extended: true }))

music.use('/public', express.static(`${__dirname}/public`));


music.use(express.urlencoded({
  extended: false
  }));

  music.use(
        fileupload({
          createParentPath: true,
          uriDecodeFileNames: true,
          limits: { fileSize: 10 * 1024 * 1024 },
        })
      )


  
const MusicSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
  track_author: String,
  track_author_id: String,
  track_name: String,
  track_description_en: String,
  track_description_ru: String,
  track_image: String,
  track_source: String,
  track_likes: [String]
  }, 


{
  timestamps: true
});
const Music = mongoose.model('Music', MusicSchema, 'Music');

// --------------GET ALL TRACKS-----------------
music.get('/', (req, res) => {
  
  Music.find({}).then(function (music) {
    res.status(200).send(music);
});
})


// --------------POST NEW TRACK-----------------
music.post('/add', (req, res) => {

  try {
    const dataFromOutside = req.body
    const myId = new mongoose.Types.ObjectId();
    const trackFile = req.files.file__audio;
    const imageFile = req.files.file__image;
    trackFile.mv('./public/audio/' + dataFromOutside.track_name + '.mp3');
    if (imageFile) imageFile.mv('./public/pictures/' + imageFile.name);
  let imagePath, trackPath
  trackPath = `http://localhost:3020/music/public/audio/${dataFromOutside.track_name + '.mp3'}`
  if (imageFile) imagePath = `http://localhost:3020/music/public/pictures/${imageFile.name}`
    
    const Track = new Music({
      _id : myId,
      track_author: dataFromOutside.track_author,
      track_author_id: dataFromOutside.track_author_id,
      track_name: dataFromOutside.track_name,
      track_image: imagePath ?? 'https://img.freepik.com/premium-photo/neon-flat-musical-note-icon-3d-rendering-ui-ux-interface-element-dark-glowing-symbol_187882-2481.jpg?size=626&ext=jpg',
      track_source: trackPath,
      track_likes: []
    })
    Track.save()
      .then(()=> {
        Music.find({})
        .then(function(track) {
      res.status(200).send(track)
      })
      })
} 
  catch (err) {
    console.log(err)
    res.status(500).send('Ашыпка!')
  }
})
// --------------DELETE TRACK FROM THE LIST BY ID-----------------
music.delete('/delete/', (req, res) => {
  try {
    const trackID = req.body._id;
    
    Music.findByIdAndDelete(trackID).then(function () {
      Music.find({}).then(function (alltracks) {
        res.status(200).send(alltracks);
        }
      )}
    )
  }
  catch {
    res.status(500).send('An error occured')
  }
}
)

// --------------ADD TRACK TO FAVOURITES-----------------
music.patch('/likes/add/', (req, res) => {
  try {
    const trackID = req.body._id;
    const userID = req.body.user_id;
    Music.findOneAndUpdate({_id: trackID}, { $push: { track_likes: userID  }}).then(function () {
      Music.find({}).then(function (favTrack) {
        res.send(favTrack);
      })
    })
  }
  catch {
    res.status(500).send('An error occured')
    }
  }
)
// --------------REMOVE TRACK FROM FAVOURITES-----------------
music.delete('/likes/delete/', (req, res) => {
  try {
    const trackID = req.body._id;
    const userID = req.body.user_id;
    Music.findOneAndUpdate({_id: trackID}, { $pull: { track_likes: userID  }}).then(function () {
      Music.find({}).then(function (favTrack) {
        res.send(favTrack);
      })
        })
      }

  catch {
    res.status(500).send('An error occured')
    }
  }
)

// --------------UPDATE TRACK INFO-----------------
music.put('/update/', (req, res) => {
  try {
    const trackID = req.body.track_id
    const imageFile = req.files?.file__image;
    const dataFromOutside = req.body
    let trackImagePath
    if (imageFile !== undefined) {
      imageFile.mv('./public/pictures/' + imageFile.name);
      trackImagePath = `http://localhost:3020/music/public/pictures/${imageFile.name}`
      }
      else trackImagePath = dataFromOutside.track_image
    
    Music.findOneAndUpdate({_id: trackID}, {track_name: dataFromOutside.track_name , track_image: trackImagePath}).then(function () {
      Music.find({}).then(function (updatedTracks) {
        res.status(200).send(updatedTracks);})
      })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('An error occured')
  }
}
)


module.exports = music