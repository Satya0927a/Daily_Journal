const Userrouter = require('express').Router()
const users = require('../models/mongo')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { infolog } = require('../utils/logger')
const { authmiddlware } = require('../utils/middleware')
// const todaysdate = new Date().toISOString().split('T')[0]
const todaysdate = new Date().toLocaleDateString('en-IN')

//* to authenticate users
Userrouter.post('/login', async (request, response, next) => {
  const { username, password } = request.body
  if (!username || !password || password.length < 3) {
    return response.status(400).json({
      "success": false,
      "error": "Invalid inputs"
    })
  }
  const user = await users.findOne({ username: username })
  const passwordcorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
  if (!user || !passwordcorrect) {
    return response.status(401).json({
      "success": false,
      "error": "User name or password is incorrect"
    })
  }
  const tokenbody = {
    username: user.username,
    userid: user._id,
  }
  const createdtoken = jwt.sign(tokenbody, process.env.SECRET)
  response.status(200).json({
    "success": true,
    "authenticated": true,
    "message": "Successfully logged in",
    "token": createdtoken,
  })
})

//*to create new user
Userrouter.post('/create', async (request, response, next) => {
  const { username, password } = request.body
  if (!password || password.length < 3) {
    return response.status(400).json({
      "success": false,
      "error": "Invalid inputs"
    })
  }
  const pass_hash = await bcrypt.hash(password, 10)
  //saving the user
  try {
    await new users({
      username: username,
      passwordHash: pass_hash,
    }).save()
    const user = await users.findOne({ username: username })
    const tokenbody = {
      username: username,
      userid: user._id
    }
    const createdtoken = jwt.sign(tokenbody, process.env.SECRET)
    response.status(200).json({
      "success": true,
      "authenticated": true,
      "message": "New user created and logged in successfully",
      "token": createdtoken
    })
  } catch (error) {
    next(error)
  }
})
//? this is dev feature
Userrouter.get('/data/all', (request, response) => {
  users.find({}).then(Data => {
    if (Data) {
      response.json(Data)
    }
    else {
      response.status(404).end()
    }
  }).catch(error => {
    console.log(error);
    response.status(500).end()
  })
})
//*to get data of user
Userrouter.get('/data', authmiddlware, async (request, response, next) => {
  try {
    const user = await users.findById(request.user.userid)
    if (!user) {
      return response.status(404).json({ success: false, error: "User not found" })
    }
    const userdata = user.data
    response.json(userdata)
  } catch (error) {
    next(error)
  }
})
//! Not being used: to add data to the user
// Userrouter.post('/data/:name', (request, response, next) => {
//   const name = request.params.name
//   const body = request.body
//   const date = new Date().toISOString().split('T')[0]

//   const modifiedbody = {
//     ...body,
//     date: date
//   }
//   users.findOneAndUpdate({ username: name }, { $push: { data: modifiedbody } }, { new: true }).then(result => {
//     const lastentry = result.data[result.data.length - 1]
//     response.send(lastentry)
//   }).catch(error => {
//     next(error)
//   })
// })

//*to update the goals section of the data when user set new goals or checks and unchecks
Userrouter.post('/data/goals/update', authmiddlware, async (request, response, next) => {
  try {
    const body = request.body
    const user = await users.findById(request.user.userid)
    if (!user) {
      return response.status(404).json({ success: false, error: "User not found" })
    }
    const entryindex = await user.data.findIndex(data => data.date === todaysdate)
    //if todays data doesnt exists creates a new
    if (entryindex === -1) {
      const newdata = {
        date: todaysdate,
        journal: null,
        goals: {
          ...body
        }
      }
      user.data.push(newdata)
      await user.save()
      return response.status(200).json({ success: true, message: "Goals updated for today" })
    }
    //if todays data exists so update the goals
    user.data[entryindex].goals = {
      ...body
    }
    await user.save()
    return response.status(200).json({ success: true, message: "Goals updated" })

  } catch (error) {
    next(error)
  }
})
//*to set the journal of a user
Userrouter.post('/data/journal/update', authmiddlware, async (request, response, next) => {
  try {
    const journaldata = request.body.data
    if (!journaldata) {
      return response.status(400).send({ success: false, error: "Invalid Journal input" })
    }
    const user = await users.findById(request.user.userid)
    if (!user) {
      return response.status(404).send({ success: false, error: "user not found" })
    }
    const todaysindex = user.data.findIndex(data => data.date === todaysdate)
    //*if todays data is not present
    if (todaysindex === -1) {
      const newdata = {
        date: todaysdate,
        journal: journaldata,
        goals: null
      }
      user.data.push(newdata)
      await user.save()
      return response.status(200).json({ success: true, message: "Added the journal of the day",lastdata:newdata })
    }
    //*if data is present with journal set to null
    else {
      if (!user.data[todaysindex].journal) {
        user.data[todaysindex].journal = journaldata
      }
      else {
        return response.status(400).json({ success: false, error: "You can only set the journal once in a day" })
      }
    }
    await user.save()
    response.status(200).json({ success: true, message: "Added the journal of the day",lastdata:user.data[todaysindex] })
  } catch (error) {
    next(error)
  }
})

module.exports = Userrouter