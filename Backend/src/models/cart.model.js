import mongoose from 'mongoose';
import priceSchema from './price.schema.js';
const cartSchema = new mongoose.Schema({
    user:{
        type:mongoose.schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    items:[
        {
            product:{
                 type:mongoose.schema.Types.ObjectId,
                 ref:'product',
                 required:true
            },
            variant:{
                 type:mongoose.schema.Types.ObjectId,
                 ref:'variant'
            },
            quantity:{
                 type:Number,
                 default: 1
            },
            price:{
               type:priceSchema,
               required:true
            }
        }
    ]
})

const cartModel = mongoose.model('cart',cartSchema);

export default cartModel;