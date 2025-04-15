import mongoose from "mongoose";

// Function to generate a random 6-character alphanumeric ID (first 2 letters, last 4 digits)
const generateInvoiceId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let result = '';

  // Generate first 2 uppercase letters
  for (let i = 0; i < 2; i++) {
    const randomLetterIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomLetterIndex];
  }

  // Generate last 4 digits
  for (let i = 0; i < 4; i++) {
    const randomNumberIndex = Math.floor(Math.random() * numbers.length);
    result += numbers[randomNumberIndex];
  }

  return result;
};

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be a non-negative number"]
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"]
  },
  discount: {
    type: Number,
    default: 0, // Default to 0 if no discount is provided
    min: [0, "Discount must be a non-negative number"]
  },
  gst: {
    type: Number,
    default: 0, // Default to 0 if no GST is provided
    min: [0, "GST must be a non-negative number"]
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price must be a non-negative number"]
  }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    default: generateInvoiceId, // Generates the custom ID (2 letters, 4 numbers)
    unique: true // Ensures the invoiceId is unique
  },
  to: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  products: {
    type: [ProductSchema],
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Invoice", InvoiceSchema);