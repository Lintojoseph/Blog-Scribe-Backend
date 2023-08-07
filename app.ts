

// Import required modules
import dotenv from 'dotenv';
import express from 'express'; 
const db = require('./config/db');
import {UserRouter} from './routes/userRouter'
import {AdminRouter} from './routes/adminRouter'
const path = require('path');
import cors from 'cors'



// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// databasecall
db()

// const clientUrl = process.env.CLIENT_URL
// cors
app.use(
  cors({
    origin: 'http://127.0.0.1:5173',
    methods: ["GET", "POST", "DELETE", "PUT","PATCH"],
    credentials: true
  })
);


// routes

app.use('/',UserRouter)
app.use('/admin',AdminRouter)


// Use process.env.APP_URL if available, otherwise use port 4000
const PORT = process.env.APP_URL || 4000;
console.log(process.env.APP_URL)

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
