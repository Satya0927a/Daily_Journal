const { errorlog } = require("./logger");

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

module.exports = {errorHandler,unknownEndpoints}