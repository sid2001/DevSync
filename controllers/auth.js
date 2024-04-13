const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const {sendMail} = require('../services/mailer');
const {redisClient} = require('../redis');
const User = require('../models/user');
const {v4:uuidv4} = require('uuid');
const { ConnectionStates } = require('mongoose');

require('dotenv').config();

async function postLogIn(req, res, next) {
    try {
        const { username, password } = req.body;
        console.log('login request', username, password);
        const passwordHash = password; // Assuming password is already hashed

        const reply = await redisClient.hGetAll('PendingRegistrations');

        for (const regId in reply) {
            const registration = JSON.parse(reply[regId]);
            if (registration.username === username && registration.password === password) {
                res.status(401).json({
                    "type": "error",
                    "message": "Email not verified"
                });
                return next(); // Exit middleware
            }
        }

        const [flag, user] = await User.isValidUser({ username, passwordHash });

        if (flag) {
            const { email, name, plan, _id } = user;
            let expiresIn;
            if (plan === 'basic') {
                expiresIn = '1h';
            } else if (plan === 'standard' || plan === 'premium') {
                expiresIn = '999d';
            } else {
                throw new Error('Invalid Plan');
            }

            const token = jwt.sign(
                { username, email, plan, name, _id },
                process.env.JWT_SECRET,
                { algorithm: 'HS256', expiresIn: expiresIn }
            );

            res.status(200).json({
                "type": "success",
                "token": token,
                "userData": {
                    username,
                    _id,
                    plan,
                    email,
                    name: `${name.first} ${name.last}`
                }
            });
        } else {
            res.status(400).json({
                "type": "error",
                "message": "Invalid credentials"
            });
        }
    } catch (err) {
        next(err, 'Internal Server Error');
    }
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
  const link = `http://${process.env.PUBLIC_HOST}/confirmRegistration/${regId};${otp}`;
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
async function confrimRegistration(req,res,next){
  const [regId,otp] = req.params.tag.split(';');

  console.log('request for confirmation:',regId,otp);

  redisClient.hGet('PendingRegistrations',regId)
  .then((reply)=>{
    console.log("registering user:",reply);
    const json = JSON.parse(reply);
    const {username,password,email,name} = json;
    // const passwordHash = bcrypt.hashSync(password,12);
    const passwordHash = password;
    const first = name.split(' ')[0];
    let last;
    try{
      last = name.split(' ')[1];
    }catch(err){
      console.log(err);
    }
    const userdata = {
      username,
      passwordHash,
      name:{
        first,
        last:last?last:''
      },
      email
    }
    if(otp===json.otp){
      const user = new User(userdata);
      redisClient.hDel('PendingRegistrations',regId)
      .then(async (reply)=>{
        await user.save()
        .then((doc)=>{
            // res.status(200).json({
            //   "type":"success",
            //   "message":"Registration Successful"
            // })
            res.render("registered");
        }).catch((err)=>{
          next(err);
        })
      }).catch((err)=>{
        next(err);
      })
    }else{
      res.status(400).send('Invalid OTP or link expired');
    }
    }
  ).catch((err)=>{
    next(err);
  })
  console.log('after');
}
module.exports.postLogIn = postLogIn;
module.exports.postRegister = postRegister;
module.exports.confrimRegistration = confrimRegistration;


// async function postLogIn(req,res,next) {
//   const {username,password} = req.body;
//   console.log('login request',username,password);
//   const passwordHash = password;
//   // bcrypt.hash(password,12,async function(err,passwordHash) {
//     // if(err) next(err);
//     // else{
//       redisClient.hGetAll('PendingRegistrations')
//       .then((reply)=>{
//         console.log(reply);
//         for(const regId in reply){
//           const registration = JSON.parse(reply[regId]);
//           if(registration.username===username&&registration.password===password){
//             res.status(401).json(
//               {
//                 "type":"error",
//                 "message":"Email not verified"
//               }
//             )
//             return next();
//           }
//         }
//       })
//       .then(async(data)=>{
//         const [flag,user] = await User.isValidUser({username,passwordHash});
//         console.log(flag,user);
//         if(flag){
//           const {email,name,plan,_id} = user;
//           let expiresIn;
//           if(plan==='basic'){
//             expiresIn = '1h'
//           }else if(plan==='standard'||plan==='premium'){
//             expiresIn = '999d'
//           }else{
//             next(err,'Invalid Plan');
//           }
//           const token = jwt.sign(
//             {username,email,plan,name,_id},
//             process.env.JWT_SECRET,
//             {algorithm: 'HS256',expiresIn:expiresIn},
//             function(err,token){
//               if(err) next(err);
//               else{
//                 res.status(200).json({
//                 "type":"success",
//                 "token":token,
//                 "userData":{
//                   username,
//                   _id,
//                   plan,
//                   email,
//                   name:`${name.first} ${name.last}`
//                 }
//                 })
//               }
//             }
//           );
//         }else{
//           res.status(400).json({
//             "type":"error",
//             "message":"Invalid credentials"
//           });
//         }
//       })
//       .catch(err=>{
//         next(err,'Internal Server Error');
//       })
      
//     //}
//   // })
// }