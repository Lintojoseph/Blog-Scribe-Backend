import mongoose,{Schema,Document} from "mongoose";

interface Blog {
    title: string;
    category: string;
    content: string;
  }

  const blogSchema: Schema<Blog & Document> = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
  });

  const BlogModel = mongoose.model<Blog & Document>('Blog', blogSchema);

  export default BlogModel;