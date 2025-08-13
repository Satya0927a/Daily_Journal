const express = require('express')
const app = express()
const mongoose = require('mongoose')
//custom middleware imports
const { errorHandler, unknownEndpoints } = require('./utils/middleware')
//user router import
const Userrouter = require('./controllers/user')
//config imports
const { USERDATA_URI } = require('./utils/config')
//logger imports
const {errorlog, infolog } = require('./utils/logger')
//connecting with the database
mongoose.connect(USERDATA_URI).then(result=>{
    infolog('connected to the database successfully');
    
}).catch(error=>{
    errorlog('couldnot connect to the database')
    process.exit(1)
})

app.use(express.json());

app.use(express.static('dist'))
//router containing out main user api to login create and handle data
app.use('/api',Userrouter)
//to handle all errors
app.use(errorHandler)
//to catch all endpoints
app.use(unknownEndpoints);


module.exports = app