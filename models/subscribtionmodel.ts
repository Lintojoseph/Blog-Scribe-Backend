
import mongoose, { Document, Model, Schema } from "mongoose";

interface Subscription {
    plan: 'monthly' | 'annual';
    orderId: string;
    orderAmount: number;
    user: mongoose.Types.ObjectId;
  }

  const subscriptionSchema = new Schema<Subscription>({
    plan: { type: String, enum: ['monthly', 'annual'], required: true },
    orderId: { type: String, required: true },
    orderAmount: { type: Number, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true,
      },
  });

  const subscription = mongoose.model<Subscription & Document>('subscription', subscriptionSchema);
  
  export default subscription
