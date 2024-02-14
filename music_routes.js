const express = require('express')
const music = express.Router()
// const bodyParser = require('body-parser')
// music.use(express.json());



const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );

// Using bodyParser json
// music.use(bodyParser.json());
// music.use(bodyParser.urlencoded({ extended: false }))



  
const MusicSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
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


    
    const Track = new Music({
      _id : myId,
      track_name: dataFromOutside.track_name,
      track_description_en: dataFromOutside.track_description_en,
      track_description_ru: dataFromOutside.track_description_ru,
      track_image: dataFromOutside.track_image || 'https://img.freepik.com/premium-photo/neon-flat-musical-note-icon-3d-rendering-ui-ux-interface-element-dark-glowing-symbol_187882-2481.jpg?size=626&ext=jpg',
      track_source: dataFromOutside.track_source,
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
  catch {
    res.status(500).send('An error occured')
  }
})
// --------------DELETE TRACK FROM THE LIST BY ID-----------------
music.delete('/delete/', (req, res) => {
  try {
    const trackID = req.body._id;
    
    Music.findByIdAndDelete(trackID).then(function () {
      console.log("Successfully deleted");
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
    console.log(trackID, userID)
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


module.exports = music