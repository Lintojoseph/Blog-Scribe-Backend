import { subscriptions } from './../controller/paymentcontroller';
import mongoose, { Document, Model, Schema, model,CallbackError } from "mongoose";
import bcrypt from 'bcrypt';

// Define the interface for the User document (optional, but recommended for type safety)
interface IUser extends Document {
    firstname: string;
    email: string;
    password: string;
    status:boolean;
    blog:mongoose.Schema.Types.ObjectId;
    subscriptions:mongoose.Schema.Types.ObjectId;
    isPremium:boolean;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'user name is required']
    },
    email: {
        type: String,
        required: [true, 'email is required']
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    status: {
        type: Boolean,
        default: true,
    },
    blog:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog',
        required:true
    }],
    subscriptions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subscription',
        required:true
    }],
    isPremium: {
        type: Boolean,
        default: false, // Default value for a new user
      },
});



const UserModel: Model<IUser> = model<IUser>('users', userSchema);

export default UserModel
