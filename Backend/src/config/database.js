import mongoose from 'mongoose';
import { config } from './config.js';
async function connecttoDB(){
    try{
       await mongoose.connect(config.MONGO_URI);
       console.log("connected to DB");
    }
    catch(err){
        console.log(err);
    }
}

export default connecttoDB;