const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    phone_no:{type:String, required:true, unique:true,min:5},
    link_generated_at:{type:Date},
    code:{type:String},
    link_status:{type:Number},
    token:{type:String},
    login_attempt:{type:Number},
    status:{type:Number},
    password:{type:String, required:true},
},
{
    timestamps: true
})

const User = mongoose.model('users',userSchema);
module.exports = User;