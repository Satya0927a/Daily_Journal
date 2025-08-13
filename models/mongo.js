const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    username:{
        type:String,
        minLength:3,
        required:true,
        validate: {
            validator: v => v && v.trim().toLowerCase() !== 'null' && v.trim().toLowerCase() !== 'undefined',
            message: 'Username cannot be "null" or "undefined"'
    }
    },
    data:[
        {
            date:String,
            journal:String,
            goals:Object
        }
    ]
})
const users =  mongoose.model('Users', userschema)

module.exports = users

