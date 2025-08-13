const express = require('express')
const app = express()
require('dotenv').config()
const users = require('./models/mongo')
const { errorHandler, unknownEndpoints } = require('./utils/middleware')
const Userrouter = require('./controllers/user')

app.use(express.json());

app.use(express.static('dist'))
//router containing out main user api to login create and handle data
app.use('/api',Userrouter)
//to handle all errors
app.use(errorHandler)
//to catch all endpoints
app.use(unknownEndpoints);


module.exports = app