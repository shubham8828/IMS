import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Successful', 'Failed', 'Pending'],
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Cash'],
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
  cardDetails: {
    cardNumber: {
      type: String,
      required: function () { return this.paymentMethod === 'Card'; },
      match: [/^\d{16}$/, 'Please enter a valid 16-digit card number.'],
    },
    expiryDate: {
      type: String,
      required: function () { return this.paymentMethod === 'Card'; },
      match: [/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter a valid expiry date (MM/YY).'],
      maxlength: 5, // Max length of 5 characters (MM/YY)
    },
    cvv: {
      type: String,
      required: function () { return this.paymentMethod === 'Card'; },
      match: [/^\d{3}$/, 'Please enter a valid CVV (3 digits).'],
    },
  },  
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
