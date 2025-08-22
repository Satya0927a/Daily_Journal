const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    username:{
        type:String,
        minLength:[4," must be more that 3 charecters"],
        required:[true," must be given"],
        unique:true,
        validate: {
            validator: v => v && v.trim().toLowerCase() !== 'null' && v.trim().toLowerCase() !== 'undefined',
            message: 'Username cannot be "null" or "undefined"'
    }
    },
    passwordHash:String,
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

