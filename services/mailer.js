const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    type: 'OAuth2',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    refreshToken: process.env.OAUTH2_REFRESH_TOKEN
  }
})

function sendMail(mailOptions){
  return new Promise((resolve,reject)=>{
    transporter.sendMail(mailOptions,function(error,info){
      if(error){
        reject(error);
      }
      else{
        resolve(info);
      }
    })
  })
}

module.exports.sendMail = sendMail;