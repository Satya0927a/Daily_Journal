const Userrouter = require('express').Router()
const users = require('../models/mongo')

// const todaysdate = new Date().toISOString().split('T')[0]
const todaysdate = new Date().toLocaleDateString('en-IN')

//* to authenticate users
Userrouter.get('/login/:name', (request, response,next) => {
  
    const name = request.params.name
    if(!name || name.trim().toLowerCase() == "null" || name.trim().toLowerCase() == "undefined" || name == ""){
        return response.status(400).json({message:"Username cannot be empty"})
    }
    // console.log(name);
    
    users.findOne({ username: name }).then(result => {
        if (result) {
            response.json({ authenticated: true , message: "Successfully logged in"})
        }
        else {
            response.status(404).json({
                authenticated:false,
                message:"This Username does not exist Click on create"
            })
        }
    }).catch(error => {
        next(error)
    })
})

//*to create new user
Userrouter.post('/create/:name', (request, response,next) => {
    const name = request.params.name
    // console.log(name);
    users.findOne({ username: name }).then(result => {
        if (!result) {
            const emptybody = {
                username: name,
                data: []
            }
            // console.log(emptybody);
            
            new users(emptybody).save().then(result => {
                response.json({
                    authenticated:true,
                    message:"New user created and logged in successfully"
                })
            }).catch(error=>{
                next(error)
            })
        }
        else{
            response.status(409).json({
                message:"This User already exists"
            })
        }
    }).catch(error=>{
        next(error)
    })
})
//? this is dev feature
// Userrouter.get('/data', (request, response) => {
//     users.find({}).then(Data => {
//         if (Data) {
//             response.json(Data)
//         }
//         else {
//             response.status(404).end()
//         }
//     }).catch(error => {
//         console.log(error);
//         response.status(500).end()
//     })
// })
//*to get data of user
Userrouter.get('/data/:name', (request, response,next) => {
    const name = request.params.name
    users.findOne({ username: name }).then(data => {
        if (data) {
            response.json(data.data)
        }
        else {
            response.status(404).end()
        }
    }).catch(error => {
        next(error)
    })
})
//! Not being used: to add data to the user
Userrouter.post('/data/:name', (request, response,next) => {
    const name = request.params.name
    const body = request.body
    const date = new Date().toISOString().split('T')[0]
    
    const modifiedbody = {
        ...body,
        date: date
    }
    users.findOneAndUpdate({ username: name }, { $push: { data: modifiedbody } },{new:true}).then(result => {
        const lastentry = result.data[result.data.length - 1]
        response.send(lastentry)
    }).catch(error => {
        next(error)
    })
})


//*to update the goals section of the data when user set new goals or checks and unchecks
Userrouter.post('/data/goals/:name',(request, response,next)=>{
    const name = request.params.name
    const body = request.body

    users.findOne({ username: name }).then(user => {
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }
        // Find the index of today's entry
        const entryIndex = user.data.findIndex(entry => entry.date === todaysdate);
        if (entryIndex === -1) {
            const newdata = {
                date:todaysdate,
                journal:null,
                goals:{
                    ...body
                }
            }

            return users.updateOne({username:name},{"$push":{data:newdata}}).then(result=>{
                response.json({message: "goals updated"})
            }).catch(error=>{
                next(error)
            })
        }
        // Update the goals for today's entry
        const updatePath = `data.${entryIndex}.goals`;
        users.updateOne(
            { username: name },
            { "$set": { [updatePath]: body } }
        ).then(() => {
            response.json({ message: "Goals updated for today" });
        }).catch(error => {
            next(error)
        });
    }).catch(error => {
        next(error)
    });
})
//*to set the journal of a user
Userrouter.post('/data/journal/:name',(request,response,next)=>{
    const name = request.params.name
    const journaldata = request.body.data
    
    users.findOne({username:name}).then(user=>{
        const todaysdataindex = user.data.findIndex(data_s=>data_s.date === todaysdate)
        //*if the days data is not created 
        if(todaysdataindex == -1){
            const newdata = {
                date:todaysdate,
                journal: journaldata,
                goals:null
            }
            return users.findOneAndUpdate(
                {username:name},
                {"$push":{data:newdata}},
                {new:true}
            ).then((user)=>{
                response.send(user.data.at(-1))
            }).catch(error=>{
                next(error)
            })
        }
        //*if journal is already set for the day
        if(user.data[todaysdataindex].journal !== null){ 
            response.status(403).json({message:"journal can only be changed once in a day"})
            return
        }
        
        // response.send(user.data[todaysdataindex])
        //*if the days data is created and the jornal is null it sets the journal
        const updatepath = `data.${todaysdataindex}.journal`
        users.findOneAndUpdate(
            {username:name},
            {"$set":{[updatepath]:journaldata}},
            {new:true}
        ).then(user=>{
            response.send(user.data[todaysdataindex])
        }).catch(error=>{
            next(error)
        })
    }).catch(error=>{
        next(error)
    })

})

module.exports = Userrouter