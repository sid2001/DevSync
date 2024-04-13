const express = require('express');
const {WebSocketServer} = require('ws');
const app = express();
const {verifyClient} = require('./utils/scripts/auth');
const mongoose = require("mongoose");
const {redisClient} = require('./redis');
const authRoutes = require('./routes/auth');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(authRoutes);

mongoose.connect(process.env.MONGO_DB_URI,{dbName:'devsync'})
.then(()=>{
  console.log('DB connected!!');
  redisClient.connect()
  .then(()=>{
    console.log('redis connected.');
      const httpServer = app.listen({host:process.env.HOST,port:process.env.PORT},()=>{
      console.log(`server started at port ${process.env.PORT}`);
      })

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
    
      console.log(req.socket.remoteAddress);
    })
  })
  .catch(console.error)
})
.catch(console.error);


