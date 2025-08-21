require('dotenv').config()


const PORT = process.env.PORT || 3002
const URI = process.env.NODE_ENV === 'development'?process.env.TESTUSERDATA_URI : process.env.USERDATA_URI

module.exports = {PORT,URI}