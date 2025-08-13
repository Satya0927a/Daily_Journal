const errorHandler = (error,req,res,next)=>{
    console.log(error);
    if(error.name == "ValidationError"){
        res.status(400).json({message:"Username cannot be empty or null,undefined"})
    }
    else{
        res.status(500).json({message:"server side error"})

    }
}

const unknownEndpoints = (req, res) => {
    res.status(404).json({ message: "Unknown endpoint" });
}

module.exports = {errorHandler,unknownEndpoints}