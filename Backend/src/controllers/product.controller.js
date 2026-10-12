import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";
export async function createProduct(req,res){
     const { title, description, priceAmount,priceCurrency} = req.body;
     const seller = req.user;
     const files = req.files || [];
     const images = await Promise.all(files.map(async (file)=>{
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
     }));

     const product = await productModel.create({
        title,
        description,
        price:{
            amount:priceAmount,
            currency:priceCurrency || "INR"
        },
        images,
        seller:seller._id

     });

     res.status(201).json({
        message:"product created successfully",
        success:true,
        product
     })

}

export async function getSellerProducts(req,res){
   const seller = req.user;

   const products = await productModel.find({
      seller:seller._id
   })
    
   res.status(200).json({
      success:true,
      message:"products fetched successfully",
      products
   })
}

export async function getMe(req,res){
   const user = req.user;

   if(!user){
      return res.status(401).json({
         message:"not found"
      })
   }

   res.status(200).json({
      message:"Uer fetched successfully",
      success:true,
      user:{
         id:user._id,
         email:user.email,
         contact:user.contact,
         fullname: user.fullname,
         role: user.role
      }
   });


}