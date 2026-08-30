import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: false,
        default: ""
    },
    password: {
        type: String,
        required: function(){
            return !this.googleId;
        },
    },
    fullname: {
        type: String,
        required: false
    },
    displayName: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"
    },
    googleId: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: ""
    }
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('User', UserSchema);

export default userModel;