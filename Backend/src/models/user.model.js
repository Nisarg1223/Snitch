import mongoose  from "mongoose";
import bcrypt from 'bcrypt'
const UserSchema = new mongoose.Schema({
    email:{
        type:string,
        required:true,
        unique:true
    },
    contact:{
        type:string,
        required:true
    },
    password:{
        type:string,
        required:true
    },
    fullname:{
        type:string,
        required:true
    },
    role:{
        type:string,
        enum:["buyer","seller"],
        default:"buyer"
    }
})

UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
    
}
const userModel = mongoose.model('User',UserSchema);

export default userModel;