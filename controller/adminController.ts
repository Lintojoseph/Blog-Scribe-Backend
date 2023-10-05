import AdminModel from "../models/adminmodel";
const jwt = require('jsonwebtoken');
const maxAge = 3 * 24 * 60 * 60;
const secret_key = process.env.SECRET_KEY
const bcrypt = require('bcrypt');
import UserModel from "../models/usermodel";
import BlogModel from "../models/blogmodel";

interface ErrorObject {
  message: string;
  [key: string]: string; // This allows for additional properties with string values
}

const handleErrorManagement = (err: any): ErrorObject => {
  let errors: ErrorObject = { message: "" };

  if (err.code === 11000) {
    errors.message = "the Item is already exists";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach((properties: any) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }

  return errors;
};



export const adminLogin = async (req:any, res:any, next:any) => {
    try {
      let { email, password } = req.body;
      console.log(req.body,'kkk')
      let admin = await AdminModel.findOne({email:email});
        console.log(admin,'vaaaa')
      if (admin) {
        // let validPassword = await bcrypt.compare(password, admin.password);
        // console.log(validPassword,'valid')
  
        if (password === admin.password) {
          const adminId = admin._id;
          const token = jwt.sign({ adminId,role:"admin" }, secret_key, {
            expiresIn: maxAge
          });
          
  
          res
            .status(200)
            .json({ message: "Login Successfull", admin, token, success: true });
        } else {
          const errors = { password: "Incorrect admin password" };
          res.json({ errors, success: false });
        }
      } else {
        const errors = { email: "email does not exist" };
        res.json({ errors, success: false });
      }
    } catch (error:any) {
      res.json({message: error.message, success: false });
      // const errors = { email: "Incorrect admin email or password" };
      // res.json({ errors, success: false });
    }
  };

// export const authAdmin = async (req:any, res:any) => {
//     try {
//       let admin = await AdminModel.findById(req.adminId);
//       console.log(admin,'adminid')
//       if (!admin) {
//         // Handle the case where admin is not found
//         return res.status(404).json({ auth: false, message: "Admin not found" });
//       }
//       const admindetails = {
//         email: admin.email,
//       };
//       res.json({
//         auth: true,
//         result: admindetails,
//         status: "success",
//         message: "signin success",
//       });
//     } catch (error:any) {
//       res.status(400).json({ auth: false, message: error.message });
//     }
//   };
  export const getdetailsDashboard=async(req:any,res:any)=>{
    try{
      let usercount=await UserModel.find().count()
      let articlecount=await BlogModel.find().count()
      console.log(usercount,'count')
      res.status(200).json({usercount,articlecount})
    }catch(error:any){
      console.log(error)
      res.status(404).json({status:false,message:error.message})
    }
  }

  export const getusers=async(req:any,res:any)=>{
    try {
      const users = await UserModel.find()
      if (users) {
          res.status(200).json({ status: true, users })
      } else {
          res.status(500).json({ status: false, message: "Internal server error" });
      }
  } catch (err:any) {
      res.status(500).json({ status: false, message: "Internal server error" });
  }
}

export const blockusers=async(req:any,res:any)=>{
  try {
    const user = await UserModel.findOne({ _id: req.params.userId });
    if (user) {
        UserModel.updateOne({ _id: req.params.userId }, {
            $set: {
                status: false
            }
        }).then((response:any) => {
            res.status(200).json({ status: true, message: "User Blocked Successfully" });
        }).catch((err:any) => {
            res.status(500).json({ status: false, message: "Internal server error" });
        })
    } else {
        res.status(404).json({ status: false, message: "User Not Found" });
    }
} catch (err:any) {
    res.status(500).json({ status: false, message: "Internal server error" });
}
}

export const unblockusers=async(req:any,res:any)=>{
  try {
    const user = await UserModel.findOne({ _id: req.params.userId });
    if (user) {
        UserModel.updateOne({ _id: req.params.userId }, {
            $set: {
                status: true
            }
        }).then((response:any) => {
            res.status(200).json({ status: true, message: "User Blocked Successfully" });
        }).catch((err:any) => {
            res.status(500).json({ status: false, message: "Internal server error" });
        })
    } else {
        res.status(404).json({ status: false, message: "User Not Found" });
    }
} catch (err:any) {
    res.status(500).json({ status: false, message: "Internal server error" });
}
}

export const getAllArticles = async (req: any, res: any) => {
  try {
    const result = await BlogModel.find().populate({ path: 'user_id', select: 'firstname' });
    res.Pagination = req.Pagination;
    if (!result) {
      return res.status(404).json({ status: false, message: 'No articles found' });
    }

    console.log(result, 'reee'); // Log result here

    res.status(200).json({ status: true, result, paginations: req.Pagination });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
}

export const getstatics=async(req:any,res:any)=>{
  try{
    let articlecount=await BlogModel.find().count()
    let userstatics = await UserModel.aggregate([
      {
          $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 }
          } 
      },
      {
          $project: {
              _id: 0,
              month: "$_id",
              count: 1
          }
      },
      {
          $sort: { month: 1 }
      },
      {
          $group: {
              _id: null,
              data: { $push: "$count" }
          }
      },
      {
          $project: {
              _id: 0,
              data: 1
          }
      }
  ]);
  let totalArticle = await BlogModel.aggregate([
    {
        $group: {
            _id: { $month: "$course" },
            count: { $sum: 1 }
        }
    }
]);
res.status(200).json({articlecount, userstatics:userstatics[0].data,totalArticle:totalArticle[0].count})

  }catch (err:any) {
    console.log(err);
    res.status(404).json({ status: false, message: err.message });
}
}
