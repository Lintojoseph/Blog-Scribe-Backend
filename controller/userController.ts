import fs from 'fs';
import path from 'path';
import { createWindow } from 'domino';
import UserModel from '../models/usermodel';
import BlogModel from '../models/blogmodel';
const { sendEmailOTP } = require("../middleware/Nodemailer");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const maxAge = 3 * 24 * 60 * 60;
const secret_key = process.env.SECRET_KEY
import {v2 as cloudinary} from 'cloudinary';
import mongoose from 'mongoose';
import { response } from 'express';

// import { sendVerificationCode, verifyOtp } from '../helpers/otp_verification'
// import { response } from 'express';


// let userDetails: any;

const createToken = (id: string) => {
    try {
        return jwt.sign({ id }, secret_key, {
            expiresIn: maxAge
        });
    } catch (error) {
        console.error("Error while creating the JWT token:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
};

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  });

  async function handleUpload(file: any) {
    try {
      const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        folder: "Blogs",
      });
      return res;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error; // Rethrow the error to be caught by the caller
    }
  }
  


let userData: any;
let emailOtp: any;
export const userSignup = async (req: any, res: any, next: any) => {
    try {
        let { firstname, email, password } = req.body;
        console.log(email, 'hi')

        const user = await UserModel.findOne({ email });
        console.log(user, 'heee')
        if (!user) {
            userData = {
                firstname,
                email,
                password,

            };
            const otpEmail = Math.floor(1000 + Math.random() * 9000);

            emailOtp = otpEmail;

            sendEmailOTP(email, otpEmail)
                .then((info: any) => {

                })
                .catch((error: any) => {
                    throw error;
                });
            res.status(200).json({
                email: email,
                message: "OTP is send to given email ",
                otpSend: true,
            });
        } else {
            res.status(200).json({
                message: "Already user exist with this email",
                otpSend: false,
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            // If 'error' is an instance of 'Error', access its 'message' property safely.
            res.status(400).json({ status: "error", message: error.message });
        } else {
            // Handle the case when 'error' is not an instance of 'Error'.
            // You can either log an error, send a generic error message, or handle it differently based on your requirements.
            res.status(400).json({ status: "error", message: "An unknown error occurred." });
        }
    }
};
export const resendUserOTP = async (req: any, res: any) => {
    try {

        const { resendemail } = req.body

        const otpEmail = Math.floor(1000 + Math.random() * 9000);

        emailOtp = otpEmail;

        sendEmailOTP(resendemail, otpEmail)
            .then((info: any) => {

            })
            .catch((error: any) => {
                throw error;
            });
        res.status(200).json({

            message: "OTP is send to given email ",
            otpSend: true,
        });
    } catch (err) {
        if (err instanceof Error) {
            // If 'err' is an instance of 'Error', access its 'message' property safely.
            res.json({ message: err.message });
        } else {
            // Handle the case when 'err' is not an instance of 'Error'.
            // You can either log an error, send a generic error message, or handle it differently based on your requirements.
            res.json({ message: "An unknown error occurred." });
        }
    }
}
export const verifyOtp = async (req: any, res: any, next: any) => {
    try {
        const otp: string = req.body.otp;


        console.log(req.body, 'hiii')

        let { firstname, email, password } = userData;
        console.log(userData, 'dataaas')

        if (otp == emailOtp) {

            let hashpassword = await bcrypt.hash(password, 10);

            let userdetails = new UserModel({
                firstname: firstname,
                email: email,
                password: hashpassword,
            });
            console.log(userdetails, 'lets ok')
            try {
                let userdata = await userdetails.save()
                console.log(userdata, 'jjjj')
            } catch (error) {
                console.error("Error saving user:", error);
            }
            res.status(200).json({
                success: true,
                message: "Successfully registered",

                created: true,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Entered OTP from email is incorrect",
                created: false,
            });
        }
    } catch (err) {

        if (err instanceof Error) {
            // If 'err' is an instance of 'Error', access its 'message' property safely.
            res.status(400).json({ status: "error", message: err.message });
        } else {
            // Handle the case when 'err' is not an instance of 'Error'.
            // You can either log an error, send a generic error message, or handle it differently based on your requirements.
            res.status(400).json({ status: "error", message: "An unknown error occurred." });
        }
    }
};

export const userLogin = async (req: any, res: any, next: any) => {

    try {
        const { email, password } = req.body;
        console.log(req.body, 'loginnnn')
        // throwing error if values are not provided
        if (!email || !password) throw Error("All Fields required");
        // finding the user
        const user: any = await UserModel.findOne({ email: email });
        console.log(user.status, "status")
        console.log(user, 'userrr')
        if (user) {
            //checking user status
            if (user.status) {
                //checking user password

                const validPassword = await bcrypt.compare(password, user.password);
                console.log(password, 'currentpass')
                console.log(user.password, 'installed pass')
                console.log(validPassword, 'pass')
                if (validPassword) {
                    //creating twt token using user id
                    const token = createToken(user._id);
                    console.log(token, 'token')
                    res.status(200).json({ user, token, login: true });
                } else {
                    res.json({ login: false, message: "Incorrect username or password" });
                }
            } else {
                res.json({ status: "Blocked", message: "Account suspended" })
            }
        } else {
            res.json({ message: "Email not exists", login: false })
        }
    } catch (error) {
        next(error)
    }
}





// export const writeBlog = async (req: any, res: any, next: any) => {
//     try {
//       const { title, category, content } = req.body;
  
//       console.log(req.body, 'haii');
  
//       // Extract image and paragraphs
//       const dom = createWindow(content);
//       const document = dom.document;
  
//       const imgElement = document.querySelector('img');
//       const imageData = imgElement?.src.replace(/^data:image\/\w+;base64,/, '') || '';
//       const imageBuffer = Buffer.from(imageData, 'base64');
//       const imageFilename = 'Blog'; // Set the image filename
  
//       // Save the image to a file
//       const outputFolder = path.join(__dirname, '..', 'public', 'images', 'Blog');
//       if (!fs.existsSync(outputFolder)) {
//         fs.mkdirSync(outputFolder, { recursive: true });
//       }
//       const imagePath = path.join(outputFolder, imageFilename);
//       fs.writeFileSync(imagePath, imageBuffer);
  
//       // Remove the img element from the DOM
//       imgElement.remove();
  
//       // Extract paragraphs
//       const paragraphs = Array.from(document.querySelectorAll('p')).map((p: any) => p.textContent);
  
//       // Create new blog
//       const newBlog = new BlogModel({
//         title,
//         category,
//         content: paragraphs.join('\n'), // Join paragraphs with newline
//         image: imageFilename, // Set the image filename
//       });
//       await newBlog.save();
  
//       res.status(201).json({ blog: newBlog });
//     } catch (error) {
//       console.error('error', error);
//       res.status(500).json({ message: 'internal server error' });
//     }
//   };

// export const writeBlog = async (req: any, res: any, next: any) => {
//     try {
//       const { title, category, content } = req.body;
  
//       // Create a DOM environment
//       const dom = createWindow(content);
//       const document = dom.document;
  
//       // Extract and process images
//       const imgElements = Array.from(document.querySelectorAll('img'));

//       const imagePaths: string[] = [];
  
//       imgElements.forEach((imgElement: any, index: number) => {
//         const imageData = imgElement.src.replace(/^data:image\/\w+;base64,/, '');
//         const imageBuffer = Buffer.from(imageData, 'base64');
//         const imageFilename = `Image${index + 1}.jpg`; // Set dynamic image filenames
  
//         const outputFolder = path.join(__dirname, '..', 'public', 'images', 'Blog');
//         if (!fs.existsSync(outputFolder)) {
//           fs.mkdirSync(outputFolder, { recursive: true });
//         }
//         const imagePath = path.join(outputFolder, imageFilename);
//         fs.writeFileSync(imagePath, imageBuffer);
  
//         // Replace image src with the new image path
//         imgElement.src = `/images/Blog/${imageFilename}`;
//         imagePaths.push(imagePath);
//       });
  
//       // Extract and process paragraphs
//       const paragraphs = Array.from(document.querySelectorAll('p')).map((p: any) => p.textContent);
  
//       // Create new blog
//       const newBlog = new BlogModel({
//         title,
//         category,
//         content: paragraphs.join('\n'), // Join paragraphs with newline
//         images: imagePaths, // Store image paths in the database
//       });
//       await newBlog.save();
  
//       res.status(201).json({ blog: newBlog });
//     } catch (error) {
//       console.error('error', error);
//       res.status(500).json({ message: 'internal server error' });
//     }
// };

export const writeBlog = async (req: any, res: any) => {
    try {
      const { title, category, content } = req.body;
      console.log(req.userId)

      const likes=0;
      const is_premium = false;
      // Create a DOM environment
      const dom = createWindow(content);
      const document = dom.document;
  
      // Extract and process paragraphs
      const paragraphs = Array.from(document.querySelectorAll('p')).map((p: any) => p.textContent);
  
      // Extract image sources
      const imgElements: any = Array.from(document.querySelectorAll('img'));
      const imageSources: string[] = imgElements.map((imgElement: any) => imgElement.src);
  
      // Upload images to Cloudinary in parallel
      const uploadPromises = imageSources.map(async (imageSrc: string) => {
        const imageData = imageSrc.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(imageData, 'base64');
  
        // Upload image to Cloudinary
        const dataURI = 'data:image/jpeg;base64,' + imageBuffer.toString('base64');
        const cldRes = await handleUpload(dataURI);
  
        return cldRes.secure_url;
      });
  
      // Wait for all images to be uploaded
      const imagePaths = await Promise.all(uploadPromises);
  
      // Create new blog
      const newBlog = new BlogModel({
        title,
        category,
        content: paragraphs.join('\n'), // Join paragraphs with newline
        images: imagePaths, // Store Cloudinary image URLs in the database
        user_id: req.userId,
        likes:[],
        is_premium
      });
      await newBlog.save();
  
      res.status(201).json({ blog: newBlog });
    } catch (error) {
      console.error('error', error);
      res.status(500).json({ message: 'internal server error' });
    }
  };
  
  
  


export const articleBlog = async (req: any, res: any, next: any) => {
    try {
        const blogs = await BlogModel.find()
        // console.log(blogs, 'blog')
        res.status(200).json({ blogs })
    } catch (error) {
        console.error("error occured", error)
        res.status(500).json({ message: 'server error' })
    }
}

export const categories=async (req:any,res:any)=>{
    try{
        const category=await BlogModel.distinct('category')
        console.log(category,'categoriees')
        res.json({ categories: category })
    }catch(error){
        console.log("fetching error",error)
        res.status(500).json({message:'internal server error'})
    }
    
}

export const userArticle = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        
        console.log(  id );
        const articleUser = await BlogModel.findById(id).populate('user_id');
        
        if (!articleUser) {
            console.log('Article not found');
            return res.status(404).json({ message: 'Article not found' });
        }

        console.log(articleUser, 'article');
        res.json({ articleUser });
    } catch (error) {
        console.log('server error', error);
        res.status(500).json({ message: 'internal server error' });
    }
}

export const userProfile = async (req: any, res: any) => {
    try {
        const user = await UserModel.findById({ _id: req.userId });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userBlogs = await BlogModel.find({ user_id: user._id });

        const userWithBlogs = {
            ...user.toObject(),
            blogs: userBlogs
        };

        console.log(userWithBlogs, 'haa');
        res.json(userWithBlogs);
    } catch (error) {
        console.log('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const createlike = async (req: any, res: any) => {
    try {
        const { id } = req.params; // Get the 'id' from route params
        const userId = req.userId._id; // Assuming you have the user ID from authentication
        console.log('Received PUT request with id:', id);
        console.log(userId,'userr id')
        const updatedBlog = await BlogModel.findByIdAndUpdate(
            id,
            {
                $push: { likes: userId },
            },
            {
                new: true,
            }
        ).exec();

        console.log(updatedBlog,'updated')

        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.json({updatedBlog});
    } catch (error) {
        res.status(422).json({ error });
    }

    // try {
    //     const { blogId } = req.body; // Assuming you pass the blog ID in the request body
    
    //     // Check if the user has already liked the blog post
    //     const existingLike = await BlogModel.findOne({ user: req.user.id, blog: blogId });
    
    //     if (existingLike) {
    //       return res.status(400).json({ message: 'You have already liked this post.' });
    //     }
    
    //     // Create a new Like document
    //     const newLike = new BlogModel({ user: req.user.id, blog: blogId });
    //     await newLike.save();
    
    //     // Update the Blog document to add the new Like reference
    //     await BlogModel.findByIdAndUpdate(blogId, { $push: { likes: newLike._id } });
    
    //     res.status(200).json({ message: 'Liked successfully' });
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Internal server error' });
    //   }
}

export const getLike=async(req:any,res:any)=>{
    try {
        const { blogId } = req.params;
    
        // Find all likes for the specified blog post
        const likes = await BlogModel.find({ blog: blogId });
    
        res.status(200).json({ likes });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

export const Editarticle=async(req:any,res:any)=>{
    try{
        BlogModel.findById({_id:req.params.articleId,user:res.userId}).then((response)=>{
            res.status(200).json({status:true,articleDetail:response})
        }).catch((error)=>{
            res.status(500).json({status:false,message:'something went wrong'})
        })
    } catch(error){
        res.status(500).json({status:false,message:'internal server error'})
    }
}

export const updateArticle = async (req: any, res: any) => {
    try {
      const { title, category, content } = req.body;
      const articleId = req.body.articleId;
  
      // Check if the article exists
      const existingArticle = await BlogModel.findById(articleId);
      if (!existingArticle) {
        return res.status(404).json({ status: false, message: 'Article not found' });
      }
  
      // Update the article
      await BlogModel.updateOne(
        { _id: articleId, user: res.userId },
        {
          $set: {
            title,
            category,
            content,
            // images: req.file.images,
          },
        }
      );
  
      res.status(200).json({ status: true, message: 'Article updated' });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  };

  export const DeleteArticle=async(req:any,res:any)=>{
    try{
        BlogModel.findOneAndDelete({user:res.userId,_id:req.params.articleId})
        .then((response)=>{
            res.status(200).json({status:true,message:'article deleted successfully'})
        }
        )
        .catch((error)=>{
            res.status(500).json({status:false,message:'internal server error'})
        })
    }catch(error){
        console.log(error)
        res.status(500).json({status:false,message:'internal server error'})
    }
  }
  