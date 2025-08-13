const mongoose = require('mongoose');
const { USERDATA_URI } = require('../utils/config');
require('dotenv').config()

const uri = USERDATA_URI

mongoose.connect(uri).then(result=>{
    console.log('connected to the database successfully');
    
}).catch(error=>{
    console.log('could not connect to the database');
    process.exit(1)
})

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

// const data = {
//     username:"rohan",
//     data:[
//         {
//             date:"11/3/2025",
//             journal:"delivery wala was so sweet i tipped him",
//             goals:{
//                 "complete assignment":true,
//                 "code for 6 hours":false,
//                 "go to gym":true
//             }
//         },
//         {
//             date:"12/3/2025",
//             journal:"today the hostel food was good after a long time",
//             goals:{
//                 "code the backend":true,
//                 "watch dsa lectures":true,
//                 "go to gym":false
//             }
//         }
//     ]
// }

const users =  mongoose.model('Users', userschema)

// new users(data).save().then(res=>{
//     console.log('saved the data');
    
// })

module.exports = users

