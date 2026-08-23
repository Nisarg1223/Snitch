import UserModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import {config} from '../config/config.js'
async function sendTokenRequest(user,res){
      const Token = jwt.sign({
        id:user._id
      },config.JWT_SECRET)
      
}

export async function RegisterController(req,res){
   const {email, password, fullname,contact,role}  = req.body();

   try{
       const existUser = await UserModel.findOne({
        $or:[
            {email},
             {contact}
        ]
       })

       if(existUser){
        return res.status(400).json({
            message:"user already exists"
        })
       }
       const user = await UserModel.create({
          email,
          password,
          fullname,
          contact,
          role
       })
   }
   catch(err){
    console.log(err);
    return res.status(500).json({
        message:"Server Error"
    })
   }
}