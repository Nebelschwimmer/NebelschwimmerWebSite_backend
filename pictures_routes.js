const express = require('express')
const pictures = express.Router()
const bodyParser = require('body-parser')
// music.use(express.json());
const fileupload = require('express-fileupload');
const path = require('path');

const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );


  pictures.use(bodyParser.json());
  pictures.use(bodyParser.urlencoded({ extended: true }))

  pictures.use('/public', express.static(`${__dirname}/public`));


pictures.use(
        fileupload({
          createParentPath: true,
          uriDecodeFileNames: true,
          limits: { fileSize: 20 * 1024 * 1024 },
        })
      )


  
const PicturesSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
  author: String,
  audthor_id: String,
  name: String,
  source: String,
  likes: [String],
  tags: [String]
  }, 


{
  timestamps: true
});
const Pictures = mongoose.model('Pictures', PicturesSchema, 'Pictures');

// --------------GET ALL PICTURES AND SEARCH-----------------
pictures.get('/', (req, res) => {
  const searchQuery = req.query.search;
  if (searchQuery !== undefined) {
    
    Pictures.find({$or: 
      [
        {author: { $regex: new RegExp(searchQuery, "ig")}},
        {name: { $regex: new RegExp(searchQuery, "ig")}},
        {tags: { $regex: new RegExp(searchQuery, "ig")}}
      ]
    }).then(function (pictures) {
      res.send(pictures);
    });
  }
  else {
    Pictures.find({}).then(function (pictures) {
      res.status(200).send(pictures);
  });
  }
})

// --------------POST NEW PICTURE(S)-----------------
pictures.post('/add', (req, res) => {

  try {
    const dataFromOutside = req.body;
    const myId = new mongoose.Types.ObjectId();
    const trackFile = req.files.file__audio;
    const imageFile = req.files.file__image;
    const picture = new Pictures({
      _id : myId,
      author: dataFromOutside.author,
      author_id: dataFromOutside.author_id,
      name: dataFromOutside.name,
      source: trackPath,
      likes: [],
      tags: []
    })
    picture.save()
      .then(()=> {
        Pictures.find({})
        .then(function(picture) {
      res.status(200).send(picture)
      })
      })
} 
  catch (err) {
    console.log(err)
    res.status(500).send('Ашыпка!')
  }
})


module.exports = pictures