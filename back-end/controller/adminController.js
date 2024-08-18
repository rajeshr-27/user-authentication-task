const asyncHandler = require('express-async-handler');
const User = require('../model/User')
//Kick Out User API
const kickOutUser = asyncHandler(async(req,res) => {
    const {username} = req.body;
    //check user by email
    const userInfoEmail = await User.findOne({email:username});

     //check user by phone number
    const userInfoPhone = await User.findOne({phone_no:username});

    if(!userInfoEmail && !userInfoPhone){
        res.status(400);
        throw new Error('Invalid username')
    }
    const userInfo = userInfoEmail || userInfoPhone;

    if(userInfo.status === 2){
        res.status(400);
        throw new Error(`This username ${username} account is locked`);
    }

    if(userInfo.token){
         //remove token
        await User.findByIdAndUpdate(userInfo._id, {token:''});

        res.status(200).json({
            status:1,
            message:`Successfully token removed by this username:${username}`,
        
        })
    }else {
        res.status(400);
        throw new Error(`Token not exist by this username ${username}`);
    }
   
})

module.exports = {kickOutUser}