const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyClient(info,cb){
  
  try{
    console.log('headers: ',info.req.url);
    const token = info.req.url.split('=')[1].trim();
    // console.log('token from verifier:',token);
    const tokenData = jwt.verify(token,process.env.JWT_SECRET);
    console.log('tokeData: ',tokenData);

    const userData = {
      username:tokenData.username,
      expiresIn:parseInt(tokenData.exp)-parseInt(tokenData.iat),
      name:tokenData.name,//object of first and last name
      email:tokenData.email,
      plan:tokenData.plan,
      _id: tokenData._id
    }
    info.req.userData = userData;
  }catch(err){
    console.error(err);
    cb(false,401,'Token expired or invalid');
  }
  cb(true);
}
module.exports.verifyClient = verifyClient;