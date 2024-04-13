const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name:{
    first:{
      type:String,
      required:true
    },
    last:{
      type:String,
    }
  },
  username: {
    type:String,
    required:true
  },
  passwordHash: {
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  }
})
userSchema.statics.isValidUsername = async function(username){
  try{
    const user = await this.find({username:username});
    if(user.length>0) return false;
    else return true;
  }catch(err){
    console.error('Error while validating username: ',err);
  }
}
userSchema.statics.isUniqueEmail = async function(email){
  try{
    const user = await this.find({email:email});
    if(user.length>0) return false;
    else return true;
  }catch(err){
    console.error('Error while validating email: ',err);
  }
}
userSchema.statics.isUniqueUsername = async function(username){
  try{
    const user = await this.find({username:username});
    if(user.length>0) return false;
    else return true;
  }catch(err){
    console.error('Error while validating username: ',err);
  }
}
userSchema.statics.isValidUser = async function({username,passwordHash}){
  try{
    const user = await User.findOne({username:username});
    if(!user) return false;
    else if(user.passwordHash === passwordHash) return true;
    else return false;
  }catch(err){
    console.error('Error while validating user: ',err);
  }
}
const User = mongoose.model('User',userSchema);
module.exports = User;