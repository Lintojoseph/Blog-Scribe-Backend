
import Razorpay from "razorpay";
import crypto from "crypto";
import UserModel from "../models/usermodel";
import subscription from "../models/subscribtionmodel";

import mongoose from "mongoose";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
  throw new Error('Razorpay environment variables are not defined.');
}

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_SECRET_ID;


export const subscriptions = async (req:any, res:any) => {
  try {
    
    const user = await UserModel.findById({ _id:req.userId });
    console.log(user,'iiii')

    const instance = new Razorpay({
      key_id,
      key_secret,
    });
    const plan = req.body.plan;
    console.log(plan,'plaaan')
    const planAmount = plan === 'monthly' ? 50 : 500;
    const amountInPaise = Math.round(planAmount * 100);
    const options = {
      amount: amountInPaise < 100 ? 100 : amountInPaise,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, amount, user } = req.body;
    console.log('Received Data:', req.body); 
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Generate expected signature using your Razorpay secret key
    const expectedSign = crypto.createHmac("sha256", key_secret).update(sign.toString()).digest("hex");
    console.log('Received Signature:', razorpay_signature);
    console.log(expectedSign,'expexttt')
    // Verify the signature
    if (razorpay_signature === expectedSign) {
      // Signature is valid, proceed with storing the subscription details
      try {
        const subscriptionData = {
          plan: plan,
          orderId: razorpay_order_id,
          orderAmount: amount*100,
          user: user,
        };
        console.log(subscriptionData,'subscrrrr')

        // Save subscription details to MongoDB
        const newSubscription = await subscription.create(subscriptionData);

        // You can send a success response or do additional processing here
        res.status(200).json({ status: "success", message: "Payment verified", subscription: newSubscription });
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