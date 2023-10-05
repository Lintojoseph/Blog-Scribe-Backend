import mongoose, { Document, Model, Schema } from "mongoose";

// Define the interface for the document
interface IAdminDocument extends Document {
  email: String;
  password: String;
}

// Define the schema
const AdminSchema = new Schema<IAdminDocument>({
  email: {
    type: String,
    required: true,
    
  },
  password: {
    type: String,
    required: true,
  },
});

// Define the model
const AdminModel: Model<IAdminDocument> = mongoose.model("Admin", AdminSchema);

export default AdminModel;
