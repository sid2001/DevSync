const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyClient(info,cb){
  const token = info.req.headers['authorization'].split(' ')[1].trim();
  console.log('token from verifier:',token);
  try{
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
    cb(false,401,'Unauthorized');
  }
  cb(true);
}
module.exports.verifyClient = verifyClient;