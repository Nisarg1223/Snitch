import mongoose from 'mongoose';
import cartModel from '../models/cart.model.js';
import { stockOfVariant } from '../dao/product.dao.js';
export  const addToCart = async (req,res)=>{

    const {productId,variantId} = req.body;
    const {quantity = 1} = req.body;

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
 const stock = stockOfVariant(productId,variantId);
    const cart = (await cartModel.findOne({user: req.user._id}))|| (await cartModel.create({user:req.user._id}));

    const isProductAlreadyInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId);

    if(isProductAlreadyInCart){
       const quantityInCart = cart.items.find(item=>item.product.toString() === productId && item.variant?.toString() === variantId).quantity;
       if(quantityInCart + quantity > stock){
        return res.status(400).json({
           message:`only ${stock} items left in stock and you already have ${quantityInCart} items in your cart `,
           success:false
        })
       }

       await cartModel.findOneAndUpdate(
        {user:req.user._id,"items.product": productId,"items.variant":variantId},
        {$inc:{"items.$.quantity":quantity}},
        {new:true}
       )
        return res.status(200).json({
            message:"cart updated successfully",
            success:true
        })
    }

    if(quantity > stock){
        return res.status(400).json({
            "message":`only ${stock} items left in stock`,
            success:true
        })
    };

    cart.items.push({
        product:productId,
        variant:variantId,
        quantity,
        price:product.price
    })
    await cart.save();

    return res.status(200).json({
        message:"product added in cart successfully",
        success:true
    })
}

export const getCart = async(req,res)=>{
    const user = req.user;

    let cart = await cartModel.findOne({
        user:user._id
    }).populate("items.product");

    if(!cart){
        cart = await cartModel.create({
            user:user._id
        });
    }

    return res.status(200).json({
        message:"cart fetched successfully",
        success:true,
        cart
    })
}