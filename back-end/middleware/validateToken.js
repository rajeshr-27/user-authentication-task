const jwt = require('jsonwebtoken');
const User = require('../model/User');
const asyncHandler = require('express-async-handler');
const validateToken =  asyncHandler(async (req,res,next) => {
    let token;
    const authHeader = req.headers.Authorization || req.headers.authorization;
    if(authHeader){
        token = authHeader.split(' ')[1];
        //userinfo
        const userInfo = await User.findOne({token:token});
        if(!userInfo){
            res.status(401);
            throw new Error('token removed')
        }
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoder) => {
            if(err){
                res.status(401);
                throw new Error('Invalid token')
            }
            req.user = decoder.user;
            next()
        })
    }
    if(!token){
        res.status(400);
        throw new Error('Token not exist');
    }
})

module.exports = validateToken;