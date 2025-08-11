const express = require('express')
const app = express()
require('dotenv').config()
const users = require('./models/mongo')
const todaysdate = new Date().toISOString().split('T')[0]

app.use(express.json());

app.use(express.static('dist'))
//to authenticate user 
app.get('/api/login/:name', (request, response) => {
    const name = request.params.name
    users.findOne({ username: name }).then(result => {
        if (result) {
            response.json({ authenticated: true , message: "successfully logged in"})
        }
        else {
            response.status(404).json({
                authenticated:false,
                message:"This Username does not exist"
            })
        }
    }).catch(error => {
        console.log(error);
        response.status(500).json({
            message:"error 500 server end problem"
        })
    })
})

//to create new user
app.post('/api/create/:name', (request, response) => {
    const name = request.params.name
    users.findOne({ username: name }).then(result => {
        if (!result) {
            const emptybody = {
                username: name,
                data: []
            }
            new users(emptybody).save().then(result => {
                response.json({
                    authenticated:true,
                    message:"New user created and logged in successfully"
                })
            })
        }
        else{
            response.status(409).json({
                error:"USER_ALREADY_EXISTS",
                message:"This User already exists"
            })
        }
    })
})

// //dev feature
// app.get('/api/data', (request, response) => {
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

//to get data of user
app.get('/api/data/:name', (request, response) => {
    const name = request.params.name
    users.findOne({ username: name }).then(data => {
        if (data) {
            response.json(data.data)
        }
        else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log(error);
        response.status(500).end()
    })
})

//to add data to the user
app.post('/api/data/:name', (request, response) => {
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
        console.log(error);
        response.status(500).end()
    })
})

//to update the goals section of the data when user set new goals or checks and unchecks
app.post('/api/data/goals/:name',(request, response)=>{
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
            console.log(error);
            response.status(500).json({ message: "Server error" });
        });
    }).catch(error => {
        console.log(error);
        response.status(500).json({ message: "Server error" });
    });
})

//to set the journal of a user
app.post('/api/data/journal/:name',(request,response)=>{
    const name = request.params.name
    const journaldata = request.body.data
    
    users.findOne({username:name}).then(user=>{
        const todaysdataindex = user.data.findIndex(data_s=>data_s.date === todaysdate)
        //if the days data is not created 
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
            })
        }
        if(user.data[todaysdataindex].journal !== null){ 
            response.status(403).json({message:"jornal can only be changed once in a day"})
            return
        }
        
        // response.send(user.data[todaysdataindex])
        //if the days data is created and the jornal is null it sets the journal
        const updatepath = `data.${todaysdataindex}.journal`
        users.findOneAndUpdate(
            {username:name},
            {"$set":{[updatepath]:journaldata}},
            {new:true}
        ).then(user=>{
            response.send(user.data[todaysdataindex])
        })
    })

})

const port = process.env.PORT || 3002
app.listen(port, () => {
    console.log(`server listening in port ${port}`);

})