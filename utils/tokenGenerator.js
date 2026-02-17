const jwt=require('jsonwebtoken');
const generateToken=(user)=>{

    return jwt.sign({user_id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'1y'})

}   
module.exports=generateToken;