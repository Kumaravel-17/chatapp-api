const jwt=require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");

const authMiddleware=(req,res,next)=>{
    const authTolken= req.cookies.auth_token;
    if(!authTolken){
        return responseHandler(res,401,false,"unauthorized Access");
    }
    try{
        const decoded=jwt.verify(authTolken,process.env.JWT_SECRET_KEY);
        req.user={userId:decoded.user_id};
        next();
    }catch(error){
        console.error("Error in authMiddleware:", error);
        return responseHandler(res,401,false,"Invalid token");
    }
}
module.exports=authMiddleware;      