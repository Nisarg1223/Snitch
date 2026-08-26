import mongoose  from "mongoose";
import bcrypt from 'bcrypt'
const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    contact:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["buyer","seller"],
        default:"buyer"
    }
})

UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
    
}
const userModel = mongoose.model('User',UserSchema);

export default userModel;