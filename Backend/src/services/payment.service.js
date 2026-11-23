import Razorpay from 'razorpay';
import { config } from '../config/config.js';

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SCRET
})

export const createOrder = async({amount,currency="INR"})=>{
    const option = {
        amount: amount * 100,
        currency
    }
    const order = razorpay.orders.create(option);

    return order;
}