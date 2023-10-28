import mongoose,{Schema,Document} from "mongoose";

interface Blog {
    title: string;
    category: string;
    content: string;
    images:[string];
    createdAt:Date;
    likes:mongoose.Schema.Types.ObjectId;
    user_id:mongoose.Schema.Types.ObjectId;
    // isPremium:Boolean;
  }

  const blogSchema: Schema<Blog & Document> = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    images:{type:[String], required:true},
    createdAt:{type:Date,default: Date.now},

    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users' // Reference to the User model (or whatever your user schema is called)
  }],
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'users',required:true},
    // isPremium:{type: Boolean}
  });

  const BlogModel = mongoose.model<Blog & Document>('Blog', blogSchema);

  export default BlogModel;