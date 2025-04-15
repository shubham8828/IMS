import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true, 
    trim: true, 
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Please provide a valid email address",
    ],
    index: true,
  },
  name: {  
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  shopname: {
    type: String,
    required: [true, "Shop name is required"],
    default: "N/A",
    trim: true,
    maxlength: [100, "Shop name cannot exceed 100 characters"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{10}$/, "Phone number must be 10 digits"],
  },
  address: {
    localArea: {
      type: String,
      required: [true, "Local area is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required" ],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    pin: {
      type: String,
      required: [true, "PIN is required"],
      match: [/^\d{6}$/, "PIN must be 6 digits"],
    },
  },
  createdBy:{
    type:String,
    required:true,
  },
  
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  image: {
    type: String, 
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user", "root"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;

