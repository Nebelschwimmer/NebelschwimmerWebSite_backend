
const express = require('express');
const texts = express.Router();
const { getAuth } = require('firebase-admin/auth');


const mongoose = require("mongoose");
mongoose.connect(
  process.env.URI
  );

const TextsSchema = new mongoose.Schema({
  _id : mongoose.Types.ObjectId,
  author_en: String,
  author_ru: String,
  publisher_id: String,
  name_en: String,
  name_ru: String,
  content_en: String,
  content_ru: String,
  likes: [String],
  comments: 
    [
      {
        type: new mongoose.Schema(
          {
          user_id: String, 
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
texts.get('/', async (req, res) => {
  const searchQuery = req.query.search;
  if (searchQuery !== undefined) {
    
    await Texts.find({ $or: 
      [
        {author_en: { $regex: new RegExp(searchQuery, "ig")}},
        {author_ru: { $regex: new RegExp(searchQuery, "ig")}},
        {name_en: { $regex: new RegExp(searchQuery, "ig")}},
        {name_ru: { $regex: new RegExp(searchQuery, "ig")}},
        {content_en: { $regex: new RegExp(searchQuery, "ig")}},
        {content_ru: { $regex: new RegExp(searchQuery, "ig")}}
      ]
    }).then(function (text) {
      res.send(text);
    });
  }
  else {
    const page = req.query.page;
    
    let sort = req.query.sort;
    console.log(sort)
    const limit = 5;
    const textsNumber = await Texts.countDocuments({}).exec();
    let totalPages = Math.floor(textsNumber / limit);

    if (textsNumber > totalPages * limit)
    totalPages = Math.floor(textsNumber / limit) + 1

    await Texts.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({createdAt: sort})
    .then(function (texts) {
      res.send({texts, 
        totalPages: totalPages})
  });
  }
})

// --------------GET SINGLE TEXT BY ID-----------------
texts.get('/:textID', async (req, res) => { 
  const textID = req.params.textID;
  await Texts.findById(textID).then(function (text) {
    res.send(text);
    
});
})

// --------------POST NEW TEXT-----------------
texts.post('/add', (req, res) => {
    try {
      const dataFromOutside = req.body
      const myId = new mongoose.Types.ObjectId();
      let enContent, ruContent, nameEn, nameRu, authorRu, authorEn;
      if (!dataFromOutside.name_en) 
      nameEn =  dataFromOutside.name_ru || 'No English Name'
      else nameEn = dataFromOutside.name_en;
      if (!dataFromOutside.name_ru) 
      nameRu = dataFromOutside.name_en || 'Нет русс. назв.'
      else nameRu = dataFromOutside.name_ru;
      
      if (!dataFromOutside.content_en) 
        enContent = ''
      else enContent = dataFromOutside.content_en;

      if (!dataFromOutside.content_ru) 
        ruContent = ''
      else ruContent = dataFromOutside.content_ru;

      if(!dataFromOutside.author_en)
      authorEn = dataFromOutside.author_ru || 'Anonymous';
      else authorEn = dataFromOutside.author_en

      if(!dataFromOutside.author_ru)
      authorRu = dataFromOutside.author_en || 'Аноним';
      else authorRu = dataFromOutside.author_ru
      
      const singleText = new Texts({
        _id: myId,
        author_en: authorEn,
        author_ru: authorRu,
        publisher_id: dataFromOutside.author_id,
        name_en: nameEn,
        name_ru: nameRu,
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
      })
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
        })}
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
        res.status(200).send(updatedText);})
      })
  }
  catch {
    res.status(500).send('An error occured')
  }
}
)

// --------------FIND TEXT AND UPDATE EN NAME-----------------
texts.put('/update/name_en/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const dataFromOutside = req.body
    
    Texts.findOneAndUpdate({_id: textID}, {name_en: dataFromOutside.name_en}).then(function () {
      Texts.findById(textID).then(function (updatedText) {
        res.status(200).send(updatedText);})
      })
  }
  catch {
    res.status(500).send('An error occured')
  }
}
)

// --------------FIND TEXT AND UPDATE RU NAME-----------------
texts.put('/update/name_ru/:textID', (req, res) => {
  try {
    const textID = req.params.textID;
    const dataFromOutside = req.body
    
    Texts.findOneAndUpdate({_id: textID}, {name_ru: dataFromOutside.name_ru}).then(function () {
      Texts.findById(textID).then(function (updatedText) {
        res.status(200).send(updatedText);})
      })
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
// --------------FIND AUTHOR'S INFO OF THE COMMENTS-----------------
texts.patch('/comments/getAuthorName/', (req, res) => {
  
  try {
  const userID = req.body.user_id;
  
  getAuth().getUser(userID).then(userRecord => 
    res.status(200).send(JSON.stringify({author_name: userRecord.displayName, author_avatar: userRecord.photoURL, message: "Success"})))
    .catch(errorInfo => {
    if (errorInfo.code === 'auth/user-not-found')
    res.status(200).send(JSON.stringify({message: 'User Not Found'})) 
    }
  )
  
  }
  catch (err) {
    console.log(err)
    res.status(500).send('An error occured')
  }
}
)


// --------------FIND AUTHOR'S INFO FOR TEXTS LIST-----------------
texts.patch('/getPublisherInfo/', (req, res) => {
  
  try {
  const userID = req.body.publisher_id;
  
  getAuth().getUser(userID).then(userRecord => 
    res.status(200).send(JSON.stringify({publisher_name: userRecord.displayName, publisher_avatar: userRecord.photoURL, message: "Success"})))
    .catch(errorInfo => {
    if (errorInfo.code === 'auth/user-not-found')
    res.status(200).send(JSON.stringify({message: 'User Not Found'})) 
    }
  )
  
  }
  catch (err) {
    console.log(err)
    res.status(500).send('An error occured')
  }
}
)




module.exports = texts