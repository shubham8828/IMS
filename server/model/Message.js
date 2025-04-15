import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  message: [
    {
      msg: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      sender: { type: String, required: true }
    }
  ]
});


const Message = mongoose.model('Message', messageSchema);
// Named export
export default Message;
