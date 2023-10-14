import UserModel from "../models/usermodel"
const jwt = require('jsonwebtoken')
const secret_key = process.env.SECRET_KEY

const verifyLogin=(req:any,res:any,next:any)=>{
    try{
        const authHeader=req.headers.authorization
        if(authHeader){
            const token=authHeader.split(' ')[1];
            jwt.verify(token,secret_key, async(err:any,decoded:any)=>{
                if(err){
                    res.json({status:false, message:'unauthorized'})
                }else{
                    const user=await UserModel.findOne({_id:decoded.id})
                    if(user){
                        req.userId=user._id
                        next()
                    }else{
                        res.status(404).json({status:false,message:'user not exist'})
                    }
                }
            })
        }else{
            res.json({status:false,message:'token not provided'})
        }
    }catch(err){
        res.status(401).json({message:'not authorized'})
    }
}

export default verifyLogin