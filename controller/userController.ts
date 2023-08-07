import usermodel from '../models/usermodel'
const { sendEmailOTP } = require("../middleware/Nodemailer");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const maxAge = 3 * 24 * 60 * 60;
const secret_key = process.env.SECRET_KEY
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




let userData: any;
let emailOtp: any;
export const userSignup = async (req: any, res: any, next: any) => {
    try {
        let { firstname, email, password } = req.body;
        console.log(email,'hi')

        const user = await usermodel.findOne({ email });
        console.log(user,'heee')
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
        

        console.log(req.body,'hiii')

        let {firstname,  email, password } = userData;
        console.log(userData,'dataaas')

        if (otp == emailOtp) {

            let hashpassword = await bcrypt.hash(password, 10);

            let userdetails = new usermodel({
                firstname:firstname,
                email:email,
                password: hashpassword,
            });
            console.log(userdetails,'lets ok')
            try{
            let userdata=await userdetails.save()
            console.log(userdata,'jjjj')
            }catch(error){
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

export const userLogin= async (req:any, res:any, next:any) => {
    
    try {
        const { email, password } = req.body;
        console.log(req.body,'loginnnn')
        // throwing error if values are not provided
        if (!email || !password) throw Error("All Fields required");
        // finding the user
        const user:any = await usermodel.findOne({ email: email });
        console.log(user.status,"status")
        console.log(user,'userrr')
        if (user) {
            //checking user status
            if (user.status) {
                //checking user password
                
                const validPassword = await bcrypt.compare(password,user.password);
                console.log(password,'currentpass')
                console.log(user.password,'installed pass')
                console.log(validPassword,'pass')
                if (validPassword) {
                    //creating twt token using user id
                    const token = createToken(user._id);
                    console.log(token,'token')
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
