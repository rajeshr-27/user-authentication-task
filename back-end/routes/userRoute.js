const express = require('express');
const asyncHandler = require('express-async-handler')
const rateLimit = require('express-rate-limit');

const { loginUser, createUser, createLink, userLink } = require('../controller/UserController');
const validateToken = require('../middleware/validateToken');
const router = express.Router();
const apiLimiterHandler =  async (req,res,next) => {
    res.status(400).json({
        title:"Validation Error",
        message:"Exceeded the request limit. Please try again after 5 minutes",
        stackTrace:""
    });
    
}
const apiLimiter  = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: apiLimiterHandler,
    standardHeaders: true,
    legacyHeaders : false
})

router.post('/create',createUser);
router.post('/create-link',createLink);
router.get('/access/:code',userLink);
router.post('/login',apiLimiter,loginUser)
router.get('/get-time',validateToken,(req,res) => {
    res.status(200).json({
        status:1,
        message:"Server current time",
        current_time: new Date(),
        user:req.user
    })
})
module.exports = router;