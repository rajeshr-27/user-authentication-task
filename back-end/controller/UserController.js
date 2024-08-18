const asyncHandler = require('express-async-handler');
const User = require('../model/User');
const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
//Creat API
const createUser = asyncHandler(async(req, res) => {
    const {name,email,phone_no,password} = req.body;
    if(!name){
        res.status(400);
        throw new Error('Please enter name');
    }
    if(!email){
        res.status(400);
        throw new Error('Please enter email');
    }
    if(!phone_no){
        res.status(400);
        throw new Error('Please enter phone number');
    }
    if(!password){
        res.status(400);
        throw new Error('Please enter password');
    }else if(password.length <5){
        res.status(400);
        throw new Error('Password should be minimum 5 character');
    }

    //check email
    const userEmail = await User.findOne({email});
    if(userEmail){
        res.status(400);
        throw new Error('Email already exist');
    }

    //check pbone numbe
    const userPhone = await User.findOne({phone_no});
    if(userPhone){
        res.status(400);
        throw new Error('Phone number already exist');
    }

    //password encrypt
    const pbkdf2 = util.promisify(crypto.pbkdf2);
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await pbkdf2(password,salt, 10000,64,'sha512');
    const hashPassword = `${salt}:${hash.toString('hex')}`;
    req.body.password = hashPassword;
    //default value set
    req.body.login_attempt = 0;
    req.body.status = 1;
    await User.create(req.body);
    res.status(200).json({
        status:1,
        message:"User created successfully",
    })
})
//Login API
const  loginUser = asyncHandler(async(req,res) => {
    //Fetch  username and password
    const {username,password} = req.body;
    if(!username){
        res.status(400);
        throw new Error('Please enter username');
    }
    if(!password){
        res.status(400);
        throw new Error('Please enter password');
    }

    //check user by email
    const userInfoEmail = await User.findOne({email:username});

    //check user by phone number
    const userInfoPhone = await User.findOne({phone_no:username});

    if(!userInfoEmail && !userInfoPhone){
        res.status(400);
        throw new Error('Invalid username')
    }

    const userInfo = userInfoEmail || userInfoPhone;
   
    if(userInfo.login_attempt >= process.env.MAX_LOGIN_ATTEMPT){
        //update login attempt
        await User.findByIdAndUpdate(userInfo._id,{status:2});
        res.status(400);
        throw new Error('Your account is locked')
    }
    //password validation
    const stordHash = userInfo.password;
    const [salt,key] = stordHash.split(':');
    const pbkdf2 = util.promisify(crypto.pbkdf2);
    const hash = await pbkdf2(password,salt,10000,64,'sha512');
    if(key === hash.toString('hex')){
        //jwt token  
        const token = jwt.sign({ 
                                 user:{id:userInfo._id,name:userInfo.name,email:userInfo.email,phone_no:userInfo.phone_no}
                            },
                            process.env.ACCESS_TOKEN_SECRET,
                            {expiresIn:'15m'}                            
                        ); 
        //update token
        await User.findByIdAndUpdate(userInfo._id,{token:token,login_attempt:0});
        res.status(200).json({
            status:1,
            message:'successfully logged in',
            token
        })  
     }else {
        //update login attempt
        await User.findByIdAndUpdate(userInfo._id,{login_attempt:userInfo.login_attempt+1});
        res.status(400);
        throw new Error('Invalid password')
     }
    
    res.send('login API');
})
//User Create Link API

const createLink = asyncHandler(async(req,res) => {
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
    const  uuid = crypto.randomUUID();
     //update generated date and time
    await User.findByIdAndUpdate(userInfo._id,{link_generated_at:new Date(),code:uuid,link_status:0});
    const  link = `${process.env.CLIENT_URL}`+'/'+uuid;
    res.status(200).json({
        status:1,
        message:'success',
        link,
    })
})

const userLink = asyncHandler(async(req,res) => {
    const {code} = req.params;
    //User info
    const userInfo = await User.findOne({code:code});
    if(!userInfo){
        res.status(400);
        throw new Error('User not exist');
    }

    if(userInfo.link_status === 1){
        res.status(401);
        throw new Error('Link already used');
    }
    //check link validate
    const link_milieseconds = new Date() - userInfo.link_generated_at;
    const link_minutes = link_milieseconds/(1000 * 60);
    if(link_minutes.toFixed(2) <= process.env.LINK_EXPIRE_MINUTES){
        
        //generate jwt token
        const token = jwt.sign({ 
           user:{id:userInfo._id,name:userInfo.name,email:userInfo.email,phone_no:userInfo.phone_no}
        },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'15m'}                            
        ); 

        //access the link
        await User.findByIdAndUpdate(userInfo._id,{link_status:1,token:token});

        res.status(200).json({
            status:1,
            message:"success",
            token
        });
    }else {
        //link expired
        req.status(400);
        throw new Error('Link expired');
    }   
})

module.exports = {createUser,loginUser,createLink,userLink};