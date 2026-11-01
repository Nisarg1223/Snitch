import mongoose from 'mongoose';
import cartModel from '../models/cart.model.js';

export  const addToCart = async (req,res)=>{

    const {productId,variantId} = req.body;

    const product = await productModel.findOne({
        _id:productId,
        "variants._id":variantId
    })

    if(!product){
        return res.status(404).json({
            message:"product or variant not fount",
            success:false
        })
    }

    const cart = (await cartModel.findOne({user: req.user._id}))|| (await cartModel.create({user:req.user._id}));

    const isProductAlreadyInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId);

    if(isProductAlreadyInCart){
        
    }
}