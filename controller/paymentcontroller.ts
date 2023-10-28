
import Razorpay from "razorpay";
import crypto from "crypto";
import UserModel from "../models/usermodel";
import SubscriptionModel, { MySubscription } from '../models/subscribtionmodel'

import mongoose from "mongoose";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
  throw new Error('Razorpay environment variables are not defined.');
}

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_SECRET_ID;
console.log(key_id, 'keeey')

export const subscriptions = async (req: any, res: any) => {
  try {

    const user = await UserModel.findById({ _id: req.userId });
    console.log(user, 'iiii')

    const instance = new Razorpay({
      key_id,
      key_secret,
    });
    const plan = req.body.plan;
    console.log(plan, 'plaaan')
    
    
    const planAmount = plan === '50' ? 100 : 500;
    console.log(planAmount, 'plaanam')

    const options = {
    amount: planAmount,
    currency: 'INR',
    receipt: crypto.randomBytes(10).toString('hex'),
    };
    console.log('Razorpay Options:', options);
    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ message: "Something gone wrong" });
      }

      console.log('Razorpay Order:', order); // Log the order object

      res.status(200).json({ data: order });
    });

  } catch (error) {
    console.error('Error in subscriptions function:', error);

    if (error instanceof Error) {
      res.status(400).json({ status: "error", message: error.message });
    } else {
      res.status(400).json({ status: "error", message: "Unknown error occurred" });
    }
  }
};


export const verifypayment = async (req: any, res: any) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, amount } = req.body;
    console.log(req.userId, 'uuuu')
    
    console.log('Received Data:', req.body);
    console.log('Amount:', amount);
    

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    console.log(key_secret, 'secret')
    // Generate expected signature using your Razorpay secret key
    const expectedSign = crypto.createHmac("sha256", key_secret).update(sign.toString()).digest("hex");
    console.log('Received Signature:', razorpaySignature);
    console.log(expectedSign, 'expexttt')
    // Verify the signature
    if (razorpaySignature === expectedSign) {
      // Signature is valid, proceed with storing the subscription details
      try {
        // const orderAmount = isNaN(amount) ? 0 : amount * 100;
        // const username=await subscription.find().populate('user','firstname')
        
        // let newSubscription: MySubscription | null = null; // Declare newSubscription here
       
        // const subscription = await SubscriptionModel.findOne().populate('user');
        // console.log(subscription,'subbbb');
        // if (subscription) {
        //   console.log(subscription.user, 'uuuser'); 
        const numericAmount = parseFloat(amount);
        console.log(numericAmount,'nummm')
      // Determine the plan based on the amount
      const user = await UserModel.findOne({ _id: req.userId });
      console.log(user,'ussser')
      if(user){
        const plan = numericAmount >= 500 ? 'annual' : 'monthly';

         let subscriptionData = {
            plan: plan,
            orderId: razorpayOrderId,
            orderAmount: amount,
            user:user.firstname,
            user_id:req.userId
          };

          console.log(subscriptionData, 'subscrrrr');

          // Now you can use subscriptionData to save or perform other operations
         const newSubscription = await SubscriptionModel.create(subscriptionData);
        // } else {
        //   console.error('Subscription not found');
        // }

        // // Save subscription details to MongoDB
        // if (newSubscription) {
        //   console.log(newSubscription, 'subsc');
        // } else {
        //   console.error('Subscription data not available');
        // }

        // You can send a success response or do additional processing here
        const updatedUser = await UserModel.findByIdAndUpdate(
          req.userId,
          { isPremium: true },
          { new: true }
        );
        console.log(updatedUser,'upppp')
        if (!updatedUser) {
          console.error('User not found for updating isPremium field');
          return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: "success", message: "Payment verified", subscription: newSubscription,user: updatedUser, });
      }else{
        console.log('no user')
      }

      } catch (error) {
        console.error('Error saving subscription details:', error);
        res.status(500).json({ status: "error", message: "Internal server error" });
      }
    } else {
      // Signature is invalid
      res.status(400).json({ status: "error", message: "Invalid signature" });
    }
  } catch (error) {
    console.error('Error in verifypayment function:', error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};