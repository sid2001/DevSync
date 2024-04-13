const express = require('express');
const {WebSocketServer} = require('ws');
const app = express();
const {verifyClient} = require('./utils/scripts/auth');
const mongoose = require("mongoose");
const {redisClient} = require('./redis');
const authRoutes = require('./routes/auth');
const multer = require("multer");
const cors = require('cors');
const path = require('path');
const {v4:uuidv4} = require('uuid');

require('dotenv').config();
// app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(multer().none());//text only form data
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(authRoutes);
app.use((err,req,res,next)=>{
  console.log(err);
  res.status(400).json({message:err});
})
mongoose.connect(process.env.MONGO_DB_URI,{dbName:'devsync'})
.then(()=>{
  console.log('DB connected!!');
  redisClient.connect()
  .then(()=>{
    console.log('redis connected.');
      const httpServer = app.listen({host:process.env.HOST,port:process.env.PORT},()=>{
      console.log(`server started at port ${process.env.PORT}`);
      })
    function messageHandler(message){
      const json = JSON.parse(message.toString('utf8'));
    }

    const wss = new WebSocketServer(
      {
        server:httpServer,
        clientTracking:true,
        path:"/connect-session",
        verifyClient:verifyClient
      }
    );

    wss.on('connection',(ws,req)=>{
      console.log("New ws connection!!");
      const sessionId = uuidv4();
      console.log('new session: ',sessionId);

      const sessionData = {
        ...req.userData,
        socket:ws,
      };
      
      redisClient.hSet('ActiveSessions',sessionId,JSON.stringify(sessionData));
      console.log(req.socket.remoteAddress);
    })
  })
  .catch(console.error)
})
.catch(console.error);



