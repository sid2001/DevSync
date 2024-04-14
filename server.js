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
const {startChildProcess} = require('./utils/scripts/childProcess.js');

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
    async function messageHandler(message){
      console.log(message.toString('utf8'));
      const json = JSON.parse(message.toString('utf8'));
      switch(json.type){
        case 'command':{
          console.log(json.data.sessionId);
          const userData = await redisClient.hGet('ActiveSessions',json.data.sessionId);
          // console.log(userData);
          const sessionData = JSON.parse(userData);
          const instructions = json.data;
          const socket = this;
          // console.log(sessionData.socket);
          startChildProcess({socket,sessionData,instructions});
          break;
        }
        default:{
          this.send(JSON.stringify({type:"error",data:"Invalid message type."}));
          console.error("Invalid message type");
        }
      }
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
      ws.on('message',messageHandler);

      redisClient.hSet('ActiveSessions',sessionId,JSON.stringify(sessionData));
      console.log(req.socket.remoteAddress);

      const payload = {
        type:"welcome",
        data:{
          sessionId,
          userData:req.userData
        }
      }
      ws.send(JSON.stringify(payload));
    })
  })
  .catch(console.error)
})
.catch(console.error);