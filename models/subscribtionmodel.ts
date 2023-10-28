import mongoose, { Document, Model, Schema } from "mongoose";

export interface  MySubscription extends Document {
  plan: 'monthly' | 'annual';
  orderId: string;
  orderAmount: number;
  user: String;
  user_id:string;
}

const subscriptionSchema = new Schema< MySubscription>({
  plan: { type: String, enum: ['monthly', 'annual'], required: true },
  orderId: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  user: {
    type: String,
    ref: 'users',
    required: true,
  },
  user_id:{type:String,
    required:true
  }
});

const SubscriptionModel = mongoose.model< MySubscription & Document>('Subscription', subscriptionSchema);

export default SubscriptionModel;
