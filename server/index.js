//Importing Variables 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const socketIO = require('socket.io');


//ImPortant Data Importing from process var
var PORT = process.env.PORT || 5001;


//Express App setup 
var app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cors());

// router
const router = express.Router();
router.get('/' , (req ,res) => {
    return res.status(200).json({mesg : "I am Alive"});
})


// using router
app.use(router);


var server = app.listen(PORT , () => {
    console.log('Server at ' + PORT);
})


var IO = socketIO(server ,{
    cors: {
        origin: "*",
    }
});

IO.on('connection' , (socket) => {

    socket.on('join' , (data) => {
        socket.emit('response' , {mesg : "helo"})
        socket.emit("joined");
    })

    socket.on('mesg' , (data) => {
        socket.emit('response' , {mesg : "<h1>Main Menu</h1><h2>loda</h2>"})
    })

    socket.on("wrongmesg" , (data) => {
        socket.emit('response' , {
            mesg : "Incorrect Choice!!! Please Choose Again!"
        });
        setTimeout(() => {
            socket.emit('response' , {
                mesg : "Last Mesg Will be Repeated"
            })
        },1000)
        
    })

    
    console.log("connected to backed!!!");
    // console.log(socket);
})






























