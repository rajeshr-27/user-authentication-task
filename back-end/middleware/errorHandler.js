const errorHandler = (err,req,res,next) => {
    const status = res.statusCode || 500;
    switch(status) {
        case 400 :
            res.json({
                title:"Validation Error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case 401 :
            res.json({
                title:"Authorization Error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case 404 :
            res.json({
                title:"Not Found Error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        case 500 :
            res.json({
                title:"Internal Server Error",
                message:err.message,
                stackTrace:err.stack
            })
            break;
        default:
            if(err){
                console.log(err);
            }else {
                console.log('no error');
            }
    }
}

module.exports = errorHandler;