const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/user');

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

function postRegister(req,res,next) {
  const {username,password,email,name} = req.body;

}

module.exports.postLogin = postLogin;