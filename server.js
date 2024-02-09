
require("dotenv").config(); 
const express = require('express')
const cors = require('cors');
const app = express();
const PORT = 3020;
const bodyParser = require('body-parser')
const fs = require('fs');
const fileupload = require('express-fileupload');

// For working with environmental files


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

const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );

  
const TextsSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
  name: String,
  content_en: String,
  content_ru: String,
  likes: [String],
  comments: [{user_id: String, comment_body: String}],
 
}, {
  timestamps: true
});
const Texts = mongoose.model('Texts', TextsSchema, 'Texts');


// --------------GET ALL TEXTS-----------------
app.get('/texts', (req, res) => {
  
  Texts.find({}).then(function (texts) {
    res.send(texts);
});
})
// --------------GET SINGLE TEXT BY ID-----------------
app.get('/texts/:textID', (req, res) => {
  const textID = req.params.textID;
  Texts.findById(textID).then(function (text) {
    res.send(text);
    
});
})

// --------------POST NEW TEXT-----------------
app.post('/texts/add', (req, res) => {
    try {
      const dataFromOutside = req.body
      const myId = new mongoose.Types.ObjectId();
      let enContent, ruContent;
      if (dataFromOutside.content_en === undefined) 
        enContent = '';
      else enContent = dataFromOutside.content_en;

      if (dataFromOutside.content_ru === undefined) 
        ruContent = '';
      else ruContent = dataFromOutside.content_ru;


      
      const singleText = new Texts({
        _id: myId,
        name: dataFromOutside.name,
        content_en: enContent,
        content_ru: ruContent,
        likes: [],
        comments: [],
      })
      singleText.save()
        .then(()=> {
        console.log('Success!')
        })
      Texts.findById(myId)
      .then(function(textById) {
        res.send(textById)
      }
    )
  }

    catch {
      res.status(500).send('An error occured')
  }
}
)
// --------------DELETE TEXT BY ID FROM ITS PAGE-----------------
app.delete('/texts/delete/:textID', (req, res) => {
    try {
      const textID = req.params.textID;
      console.log(textID)
      Texts.findByIdAndDelete(textID).then(function () {
        console.log("Successfully deleted");
        }
      )
      Texts.find({}).then(function (allTexts) {
        res.status(200).send(allTexts);
        }
      )
    }

    catch {
      res.status(500).send('An error occured')
    }
  }
)
// --------------FIND TEXT AND UPDATE-----------------
app.put('/texts/update/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const dataFromOutside = req.body
    let enContent, ruContent;
    if (dataFromOutside.content_en === undefined) 
        enContent = '';
      else enContent = dataFromOutside.content_en;

      if (dataFromOutside.content_ru === undefined) 
        ruContent = '';
      else ruContent = dataFromOutside.content_ru;
    Texts.findOneAndUpdate({_id: textID}, {content_en: enContent, content_ru: ruContent}).then(function () {
      console.log("Successfully updated");
      }
    )
    Texts.findById(textID).then(function (updatedText) {
      res.status(200).send(updatedText);
      }
    )
  }

  catch {
    res.status(500).send('An error occured')
  }
}
)

// --------------ADD TEXT TO FAVOURITES-----------------
app.patch('/texts/likes/add/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const userID = req.body.user_id;

    Texts.findOneAndUpdate({_id: textID}, { $push: { likes: userID  }}).then(function () {
      Texts.findById(textID).then(function (favText) {
        res.status(200).send(favText);
          }
        )
      }
    )
  }

  catch {
    res.status(500).send('An error occured')
    }
  }
)

// --------------REMOVE TEXT FROM FAVOURITES-----------------
app.delete('/texts/likes/delete/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const userID = req.body.user_id;

    Texts.findOneAndUpdate({_id: textID}, { $pull: {likes: userID}}).then(function () {
      Texts.findById(textID).then(function (favText) {
        res.status(200).send(favText);
          }
        )
      }
    )
  }

  catch {
    res.status(500).send('An error occured')
    }
  }
)










app.use(express.json());

// Open access to folder 'Public'
app.use('/public', express.static(`${__dirname}/public`));


const trackList = require('./trackList.json');
app.use(express.json());


  // --------Сommon vars for music API-------------
  // Reading music json 
  const readMusicJson = fs.readFileSync('./trackList.json', "utf8")  
  // Parsing music json
  const musicArrayParsed = JSON.parse(readMusicJson)
  // ID generator for music
  let randomTrackID = "id_" + Math.random().toString(16).slice(2)




  // ----------------------ROUTES----------------------------------

  //---------- GET for reading music json--------------

  app.get('/music', (req, res) => {
    res.status(200).json({ data: trackList });
    });
  
  
  //---------For uploading an audio file--------
  app.use(
    fileupload({
      createParentPath: true,
      uriDecodeFileNames: true,
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  // -----------------POST for creating new track--------------------

  app.post('/music/upload', (req, res) => {
    try {
      // If there's no file or file size exceeds
      if (!req.files || req.files.file.size > 10 * 1024 * 1024) {
        res.send({
          status: 'Failed',
          message: 'File not found or its size is too big',
        });
      } 
      // If there's a file
      else {
        // Find file in formData
        const trackFile = req.files.file;
        // The formData body
        let formBody = req.body
        // Set the default picture
        if (formBody.track_image === '') formBody.track_image = 'https://img.freepik.com/premium-photo/neon-flat-musical-note-icon-3d-rendering-ui-ux-interface-element-dark-glowing-symbol_187882-2481.jpg?size=626&ext=jpg'
      
        // Move file to folder
        trackFile.mv('../public/' + trackFile.name);
        // New track object 
        const newTrack = {
          ...formBody, 
          track_id: randomTrackID, 
          track_likes: [], 
          track_source:`http://localhost:3020/public/${trackFile.name}`
        }
        // Pushing to the array
        musicArrayParsed.push(newTrack)
        // Transforming to json
        const updatedMusicArray = JSON.stringify(musicArrayParsed)
        // Writing json
        fs.writeFileSync('./trackList.json', updatedMusicArray);
        // Stringifying json
        const resp = JSON.stringify(newTrack, undefined, 2)
        // Server response
        res.status(200).send(resp);
        
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // --------------------------------------------------------


  //----------------- DELETE for track cards---------------------

  app.delete('/music/delete', (req, res) => {
    try {
      // Request body
      const bodyOutsideData = req.body;
      // Finding track ID from request
      const trackIdFromOutside = bodyOutsideData.track_id;
      
      // Making a flag and an empty array
      let flag = false
      let filteredMusicArray = []
      // Checking if the music array has an object with the same ID as from the request: if there's one, set the flag true
      musicArrayParsed.forEach((e)=>{
        if (e.track_id === trackIdFromOutside)
        flag = true
      })
      // If the flag is true, filtering the music array and putting it in the empty array
      if (flag) {
        filteredMusicArray = musicArrayParsed.filter(f => f.track_id !== trackIdFromOutside)
      }
      
      const filteredMusicArrayJSON = JSON.stringify(filteredMusicArray)
      // console.log(filteredMusicArrayJSON)
      // Rewriting JSON
      fs.writeFileSync('./trackList.json', filteredMusicArrayJSON);
      // Sending response
      res.status(200).send(filteredMusicArrayJSON);
    }
    catch (err) {
      res.status(500).send(err);
    }

    }
  )
  //----------------- PUT for updating track cards---------------------

  app.put('/music/update', (req, res) => {
    try {

        const trackIdFromOutside = req.body.track_id
        // Finding the object with the same id as from the request, then replacing its keys values with those from the request
        musicArrayParsed.map((e)=>{
          if (e.track_id === trackIdFromOutside) {
          e.track_name = req.body.track_name;
          e.track_image = req.body.track_image;
          e.track_description_en = req.body.track_description_en;
          e.track_description_ru = req.body.track_description_ru;}
        })
        // Settig the default picture
        musicArrayParsed.map((e)=>{
          if (e.track_image === '')  e.track_image = 'https://img.freepik.com/premium-photo/neon-flat-musical-note-icon-3d-rendering-ui-ux-interface-element-dark-glowing-symbol_187882-2481.jpg?size=626&ext=jpg'
        })
        // Stringifying the music array
        const updatedMusicArray = JSON.stringify(musicArrayParsed)
        // // Writing json
        fs.writeFileSync('./trackList.json', updatedMusicArray);
        // // Server response
        res.status(200).send(updatedMusicArray);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // ----------PATCH для добавления лайка-------------

app.patch('/music/likes/', (req, res) => {

  // Request body
  const bodyOutsideData = req.body;
  // Finding track ID from request
  const trackIdFromOutside = bodyOutsideData.track_id;
  // Finding user's ID
  const userIdFromOutside = bodyOutsideData.user_id;
  // Pushing user's ID to the likes array
  musicArrayParsed.forEach(e => {
      if (e.track_id === trackIdFromOutside)
          e.track_likes.push(userIdFromOutside)
      }
    );
  // Transforming back to JSON
  const updatedMusicArray = JSON.stringify(musicArrayParsed)
  // Rewriting JSON
  fs.writeFileSync('./trackList.json', updatedMusicArray);

  // Sending response with the new JSON
    res.status(200).send(updatedMusicArray);
})


// ----------DELETE для удаления лайка-------------

app.delete('/music/likes', (req, res) => {
    // Request body
  const bodyOutsideData = req.body;
   // Finding track ID from request
  const trackIdFromOutside = bodyOutsideData.track_id;
  // Finding user's ID
  const userIdFromOutside = bodyOutsideData.user_id;

  // Mapping the array
  musicArrayParsed.map((e) => {
    //Declaring a void var
    let likesFiltered
      // If the track ID matches with those from the request body, assign the filtered music array in the
      // likesFiltered variable in a manner to remove the ID of the user who wantend to delete like.
      // Reassigning the likes array to the filtered array. 
      if (e.track_id === trackIdFromOutside) {
          likesFiltered = e.track_likes.filter((f) => f !== userIdFromOutside)
          e.track_likes = likesFiltered
      } 
    }
  );
  // Transforming back to JSON
  const updatedMusicArray = JSON.stringify(musicArrayParsed)

  // Rewriting JSON
  fs.writeFileSync('./trackList.json', updatedMusicArray);
  
  // Sending response with the new JSON
    res.status(200).send(updatedMusicArray);
})

//----------------------------------------------------------

// // -----------------GET for texts--------------------------
// const textsList = require('./texts.json');
// const { ObjectId } = require('mongodb');
// app.get('/texts', (req, res) => {
//   res.status(200).json({ data: textsList });
// });

// // -----------------POST for texts--------------------------

// app.post('/texts', (req, res) => {

// // }
// )



















  // Слушаем заданный порт
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
