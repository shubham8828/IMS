import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Routes from './routes/Routes.js';

dotenv.config();
const app = express(); 

app.use(cors(
    
    // {
    //     origin: ["https://aimps.vercel.app"],
    //     methods: ["POST", "GET","PUT","DELETE"],
    //     credentials: true
    // }
   
));  
app.use(express.json());

mongoose.connect(process.env.URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => { 
        console.error('MongoDB connection error:', error);
    });

// Middleware to handle larger payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use('/api', Routes);

app.get('/', (req, res) => {
    res.status(200).json({server:"Server is running"})  
  });  

const PORT = process.env.PORT||4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  
