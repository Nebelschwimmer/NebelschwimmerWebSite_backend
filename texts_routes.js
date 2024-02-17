
const express = require('express')
const texts = express.Router()
const url = require('url');
const querystring = require('querystring');
const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );





  
const TextsSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
  author: String,
  name: String,
  content_en: String,
  content_ru: String,
  likes: [String],
  comments: 
    [
      {
        type: new mongoose.Schema(
          {
          user_id: String, 
          user_displayName: String, 
          user_photoURL: String, 
          comment_body: String,
          },
          {
            timestamps: true
          }
        )
      }
    ],
  }, 


{
  timestamps: true
});
const Texts = mongoose.model('Texts', TextsSchema, 'Texts');


// --------------GET ALL TEXTS-----------------
texts.get('/', (req, res) => {
  const searchQuery = req.query.search;


  
  if (searchQuery !== undefined) {
    Texts.find({$or: 
          [
            {author: searchQuery},
            {name: searchQuery},
            { content_en: { $regex: new RegExp(searchQuery, "ig")}},
            { content_ru: { $regex: new RegExp(searchQuery, "ig")}}
          ]
      }).then(function (text) {
          res.send(text);
        });
  }


  else {
    Texts.find({}).then(function (texts) {
      res.send(texts);
  });
  }
})





// --------------GET SINGLE TEXT BY ID-----------------
texts.get('/:textID', (req, res) => {
  const textID = req.params.textID;
  Texts.findById(textID).then(function (text) {
    res.send(text);
    
});
})

// --------------POST NEW TEXT-----------------
texts.post('/add', (req, res) => {
    try {
      const dataFromOutside = req.body
      const myId = new mongoose.Types.ObjectId();
      let enContent, ruContent;
      if (dataFromOutside.content_en === undefined) 
        enContent = ''
      else enContent = dataFromOutside.content_en;

      if (dataFromOutside.content_ru === undefined) 
        ruContent = ''
      else ruContent = dataFromOutside.content_ru;


      
      const singleText = new Texts({
        _id: myId,
        author: dataFromOutside.user_displayName,
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
texts.delete('/delete/:textID', (req, res) => {
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
// --------------FIND TEXT AND UPDATE EN CONTENT-----------------
texts.put('/update/en/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const dataFromOutside = req.body
    Texts.findOneAndUpdate({_id: textID}, {content_en: dataFromOutside.content_en}).then(function () {
      Texts.findById(textID).then(function (updatedText) {
        res.status(200).send(updatedText);
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
// --------------FIND TEXT AND UPDATE RU CONTENT-----------------
texts.put('/update/ru/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const dataFromOutside = req.body
    Texts.findOneAndUpdate({_id: textID}, {content_ru: dataFromOutside.content_ru}).then(function () {
      Texts.findById(textID).then(function (updatedText) {
        res.status(200).send(updatedText);
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



// --------------ADD TEXT TO FAVOURITES-----------------
texts.patch('/likes/add/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const userID = req.body.user_id;
    Texts.findOneAndUpdate({_id: textID}, { $push: { likes: userID  }}).then(function () {
          Texts.findById(textID).then(function (favText) {
            res.status(200).send(favText);
          })
        })
      }

  catch {
    res.status(500).send('An error occured')
    }
  }
)

// --------------REMOVE TEXT FROM FAVOURITES-----------------
texts.delete('/likes/delete/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const userID = req.body.user_id;
    Texts.findOneAndUpdate({_id: textID}, { $pull: {likes: userID}}).then(function () {
            Texts.findById(textID).then(function (favText) {
              res.status(200).send(favText);
          })
        })
      }
  catch {
    res.status(500).send('An error occured')
    }
  }
)

// --------------ADD COMMENT-----------------
texts.post('/comments/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const commentBody = req.body.comment_body
    Texts.findOneAndUpdate({_id: textID}, { $push: 
      { comments: {
          user_id: req.body.user_id, 
          user_displayName: req.body.user_displayName , 
          user_photoURL: req.body.user_photoURL,
          comment_body: commentBody
        }
      }
    })
    .then(function () {
            Texts.findById(textID).then(function (newComments) {
              res.status(200).send(newComments);
          })
        })
      }
  catch {
    res.status(500).send('An error occured')
    }
  }
)

// --------------REMOVE COMMENT BY ITS ID-----------------
texts.delete('/comments/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const commentID = req.body.comment_id
    Texts.findOneAndUpdate({_id: textID}, { $pull: 
        {
          comments: {
            _id: commentID
          }
        }
      }
    )
    .then(function () {
            Texts.findById(textID).then(function (newComments) {
              res.status(200).send(newComments);
          })
        })
      }
  catch {
    res.status(500).send('An error occured')
    }
  }
)



module.exports = texts