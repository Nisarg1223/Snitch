import UserModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import {config} from '../config/config.js'
async function sendTokenRequest(user,res,message){
      const Token = jwt.sign({
        id:user._id
      },config.JWT_SECRET,{
        expiresIn:"7d"
      })
       res.cookie("token",Token);

  return res.status(200).json({
        message,
        success:true,
        Token,

        user:{
            id:user._id,
            email:user.email,
            contact:user.contact,
            fullname:user.fullname,
            role:user.role
        }
     

    })
}

export async function RegisterController(req,res){
   const {email, password, fullname,contact,isSeller}  = req.body;

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
          role: isSeller? "seller": "buyer",
       })

       await sendTokenRequest(user,res,"user register successfully")
   }
   catch(err){
    console.log(err);
    return res.status(500).json({
        message:"Server Error"
    })
   }
}

export async function LoginController(req,res){
    const {email,password} = req.body;

    try{
        const userExists = await UserModel.findOne({
            email
        });

        if(!userExists){
            return res.status(404).json({
                success:false,
                message:"The user is not found"
            });
        }

        const isMatch = await userExists.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Invalid username or password"
            });
        }

        await sendTokenRequest(userExists, res, "User logged in successfully");
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export async function googleCallback(req,res){
    console.log(req.user);

    res.redirect("http://localhost:5173/dashboard")
}