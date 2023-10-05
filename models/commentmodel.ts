import mongoose, { Document, Model, Schema } from "mongoose";

interface Comment{
    sender:mongoose.Schema.Types.ObjectId;
    text:string;
    timestamps:Boolean;
}

const commentSchema: Schema<Comment & Document> = new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,

    },
    text:{
        type:String,
        required:true
    }
   
},
{timestamps:true}
)    

const CommentModel = mongoose.model<Comment & Document>('comment', commentSchema);

export default CommentModel