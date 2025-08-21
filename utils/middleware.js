const { errorlog, infolog } = require("./logger");
const jwt = require('jsonwebtoken')
const errorHandler = (error,req,res,next)=>{
    errorlog(error);
    if(error.name == "ValidationError"){
        res.status(400).json(error.message)
    }
    else if(error.name === 'MongoServerError'){
      res.status(400).json({success:false,error:"Username already exists"})
    }
    else if(error.name === "JsonWebTokenError"){
      res.status(400).json({success:false,error:"token missing or invalid"})
    }
    else{
        res.status(500).json({message:"server side error"})

    }
}

const unknownEndpoints = (req, res) => {
    res.status(404).json({ message: "Unknown endpoint" });
}

const authmiddlware = (req,res,next)=>{
  let token = req.get('Authorization')
  if(token && token.toLowerCase().startsWith("bearer ")){
    token =  token.replace('Bearer ', "")
  }
  else{
    token =  null
  }
  const payload = jwt.verify(token,process.env.SECRET)
  req.user = payload
  next()
}

module.exports = {errorHandler,unknownEndpoints,authmiddlware}