const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const {sendMail} = require('../services/mailer');
const {redisClient} = require('../redis');
const User = require('../models/user');
const {v4:uuidv4} = require('uuid');
const { ConnectionStates } = require('mongoose');

require('dotenv').config();

function postLogin(req,res,next) {
  const {username,password} = req.body;

  bcrypt.hash(password,12,function(err,hashedPassword) {
    if(err) next(err);
    else{
      if(User.isValidUser({username,hashedPassword})){
        const token = jwt.sign(
          {username},
          process.env.JWT_SECRET,
          {algorithm: 'HS256',expiresIn:'1h'},
          function(err,token){
            if(err) next(err);
            else{
              res.status(200).json({
              "type":"token",
              "token":token
              })
            }
          }
        );
      }else{
        res.status(400).send('Invalid Credentials');
      }
    }
  })
}

async function postRegister(req,res,next) {
  const {username,password,email,name} = req.body;
  if(!(await User.isUniqueEmail(email))){
    res.status(400).json(
      {
        "type":"error",
        "message":"Email already exists"
      }
    )
  }else if(!(await User.isUniqueUsername(username))){
    res.status(400).json(
      {
        "type":"error",
        "message":"Username already exists"
      }
    )
  }
  const otp = otpGenerator.generate(6, {upperCase: false, specialChars: false});
  const regId = uuidv4();
  console.log(regId);
  await redisClient.hSet(
    'PendingRegistrations',
    regId,
    JSON.stringify({username,password,email,name,otp}),
    (err,reply)=>{
      if(err) next(err);
      else{
        console.log(reply);
        //implement something to notify admin or log data
      }
    }
  )
  const link = `http://localhost:3000/confirmRegistration/${regId};${otp}`;
  const mailOptions = {
    from:process.env.MAIL_USER,
    to:email,
    subject: 'Registration OTP',
    text:`Click to confirm registration: ${link}`
  }
  sendMail(mailOptions).then((data)=>{
    console.log(data);
    res.status(200).json({
      "type":"success",
      "message":"Registration OTP has been sent to your email.",
      "regId":regId
    })
  }).catch((err)=>{
    next(err);
  })
}
function confrimRegistration(req,res,next){
  const [regId,otp] = req.params.tag.split(';');
  redisClient.hGet('PendingRegistrations',regId,(err,reply)=>{
    if(err) next(err);
    else{
      const {username,password,email,name} = JSON.parse(reply);
      if(otp===reply.otp){
        const user = new User({username,password,email,name})
      }else{
        res.status(400).send('Invalid OTP or link expired');
      }
    }
  })
}
module.exports.postLogin = postLogin;
module.exports.postRegister = postRegister;
module.exports.confrimRegistration = confrimRegistration;