import Invoice from "../model/InvoiceSchema.js";
import User from "../model/User.js";
import Message from "../model/Message.js";
import bcrypt from "bcrypt"; // To hash the password
import cloudinary from "../cloudinary.js";
import Payment from "../model/payment.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const otpStorage = {};
const addUserOtpStorage = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address (set in .env)
    pass: process.env.EMAIL_PASS, // your app-specific password (set in .env)
  },
});

// ---------------------- Register API --------------------------

export const AddUser = async (req, res) => {
  try {
    const { email, name, password, phone, role } = req.body;
    const adminEmail = req.user.email;

    const admin = await User.findOne({ email: adminEmail });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    const formattedAddress = {
      localArea: admin.address.localArea.trim(),
      city: admin.address.city.trim(),
      state: admin.address.state.trim(),
      country: admin.address.country.trim(),
      pin: admin.address.pin.trim(),
    };

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      name,
      phone,
      address: formattedAddress,
      shopname: admin.shopname || "",
      password: hashedPassword,
      image: admin.image,
      createdBy: admin.email,
      role,
    });

    await newUser.save();
    res.status(200).json({ msg: "User Added successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// -------------------- LOGIN API ----------------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      image: user.image,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Return a success response with the token and user data
    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        image: user.image,
        role: user.role,
      }, // Only return necessary user fields
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};

// -------------------------------- Update API For User -----------------------------

export const update = async (req, res) => {
  try {
    const { email, name, address, image, phone, shopname, role } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ msg: "Email is required to update user details" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let updateData = {};

    // Admin updates (but should not change other users)
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    // Update shopname for admin and associated users
    if (user.role === "admin" && shopname && shopname !== user.shopname) {
      updateData.shopname = shopname;
      await User.updateMany({ createdBy: email }, { $set: { shopname } });
    }

    // Handle address update
    if (address && typeof address === "object") {
      updateData.address = { ...user.address, ...address }; // Merge new values into existing address
    }

    // Upload image if provided
    if (image && typeof image === "string" && !image.startsWith("http")) {
      try {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
        if (image.length > MAX_IMAGE_SIZE) {
          return res.status(400).json({ msg: "Image size exceeds 5MB limit" });
        }
        const uploadResult = await cloudinary.uploader.upload(image, {
          upload_preset: "eeeghag0",
          public_id: `${email}_avatar`,
          overwrite: true,
          allowed_formats: ["png", "jpg", "jpeg", "svg"],
        });

        if (!uploadResult?.secure_url) {
          return res.status(500).json({ msg: "Image upload failed" });
        }

        updateData.image = uploadResult.secure_url;
      } catch (cloudError) {
        console.error("Cloudinary upload error:", cloudError);
        return res
          .status(500)
          .json({ msg: "Error uploading image to Cloudinary" });
      }
    } else if (image) {
      updateData.image = image;
    }

    // If admin updates their image or address, update all created users
    const updatePromises = [];
    if (user.role === "admin") {
      if (updateData.image && updateData.image !== user.image) {
        updatePromises.push(
          User.updateMany(
            { createdBy: email },
            { $set: { image: updateData.image } }
          )
        );
      }
      if (updateData.address) {
        updatePromises.push(
          User.updateMany(
            { createdBy: email },
            { $set: { address: updateData.address } }
          )
        );
      }
    }

    // Apply updates
    updatePromises.push(User.updateOne({ email }, { $set: updateData }));
    await Promise.all(updatePromises);

    // Fetch updated user details
    const updatedUser = await User.findOne({ email });

    return res
      .status(200)
      .json({ msg: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error in update API:", error.message);
    return res
      .status(500)
      .json({ msg: "Internal Server Error. Please try again later." });
  }
};

// ---------------- Get Current User API ----------------------------

export const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ msg: "Invalid request: User information is missing" });
    }

    const email = req.user.email;

    // Find the user in the database
    const user = await User.findOne({ email });

    if (user) {
      // Respond with the user data, excluding sensitive fields like password
      return res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          shopname: user.shopname,
          phone: user.phone,
          address: user.address,
          image: user.image,
          role: user.role,
        },
      });
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getUser API:", error.message);

    // Respond with a generic error message
    return res
      .status(500)
      .json({ msg: "Internal Server Error. Please try again later." });
  }
};

// ------------------------ Get All Users API For Admin ----------------------

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    const user = req.user;

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --------------------- Delete User API for Admin or Root -------------------------------

export const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from URL parameters

  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid request: User ID is required" });
    }

    // Step 1: Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const email = deletedUser.email; // Extract the email of the deleted user

    // Step 2: Find all invoices created by the deleted user's email
    const invoices = await Invoice.find({ email });
    const invoiceIds = invoices.map((invoice) => invoice.invoiceId); // Collect all invoice IDs

    // Step 3: Delete all payments associated with the invoice IDs
    if (invoiceIds.length > 0) {
      await Payment.deleteMany({ invoiceId: { $in: invoiceIds } });
    }

    // Step 4: Delete the invoices
    if (invoices.length > 0) {
      await Invoice.deleteMany({ email });
    }

    // Step 5: Delete all messages associated with the user's email
    const messagesDeleted = await Message.deleteMany({ email });

    // Send a success response
    res.status(200).json({
      message: "User and associated data deleted successfully",
      details: {
        invoicesDeleted: invoices.length,
        paymentsDeleted: invoiceIds.length,
        messagesDeleted: messagesDeleted.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting user and associated data:", error);

    // Handle unexpected errors gracefully
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

// --------------------------- Create New Invoice or Bill -----------------------------------

export const newInvoive = async (req, res) => {
  try {
    const { to, phone, address, products, total } = req.body;
    const email = req.user.email;
    const newInvoice = new Invoice({
      to,
      phone,
      address,
      products,
      total,
      email,
    });
    await newInvoice.save();
    res
      .status(200)
      .json({ msg: "Invoice created successfully", invoice: newInvoice });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// ------------------------  Get All Invoice created by one user or All For user or admin ---------------------

export const invoices = async (req, res) => {
  try {
    const { email, role } = req.user;
    let query = {};

    if (role === "admin") {
      query = {};
    } else {
      query = { email: email.toLowerCase() };
    }

    const invoices = await Invoice.find(query);

    if (!invoices.length) {
      return res.status(404).json({ msg: "No invoices found" });
    }

    res.status(200).json({ invoices, user: req.user });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// ---------------------- Invoice Delete API for user or Admin -----------------------------

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params; // Extract the invoice ID from URL parameters

    // Validate the presence of the ID
    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid request: Invoice ID is required" });
    }

    // Step 1: Find and delete the invoice by ID
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Step 2: Find and delete the associated payment by invoice ID
    const deletedPayment = await Payment.findOneAndDelete({
      invoiceId: deletedInvoice.invoiceId,
    });

    // Return success response
    return res.status(200).json({
      msg: "Invoice and associated payment deleted successfully",
      deletedInvoice,
      deletedPayment,
    });
  } catch (error) {
    // Return a detailed error response
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update the invoice

export const updateInvoice = async (req, res) => {
  const { id, ...updatedInvoiceData } = req.body;

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updatedInvoiceData,
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------- Search Customer By Name --------------------------------------

export const searchCustomer = async (req, res) => {
  try {
    const email = req.user?.email;
    const role = req.user?.role;

    if (!email) {
      return res.status(400).json({ msg: "User email is required" });
    }
    let filter = role === "user" ? { email } : {};
    const invoices = await Invoice.find(filter);

    return res.status(200).json({ invoices });
  } catch (error) {
    console.error("Error in searchCustomer API:", error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//------------------------------- Save Payment Data API ------------------------------

export const makePayment = async (req, res) => {
  try {
    const {
      paymentId,
      customerName,
      amount,
      currency,
      paymentStatus,
      paymentDate,
      paymentMethod,
      invoiceId,
      remarks,
      cardDetails,
    } = req.body.transactionData;

    // Validate required fields
    if (
      !paymentId ||
      !customerName ||
      !amount ||
      !currency ||
      !paymentStatus ||
      !paymentDate ||
      !paymentMethod ||
      !invoiceId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Construct the payment object
    const paymentData = {
      paymentId,
      customerName,
      amount,
      currency,
      paymentStatus,
      paymentDate,
      paymentMethod,
      invoiceId,
      remarks,
    };

    // Add card details only if the payment method is 'Card'
    if (paymentMethod === "Card") {
      if (
        !cardDetails ||
        !cardDetails.cardNumber ||
        !cardDetails.expiry ||
        !cardDetails.cvv
      ) {
        return res
          .status(400)
          .json({ error: "Missing card details for Card payment method" });
      }
      paymentData.cardDetails = {
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiry,
        cvv: cardDetails.cvv,
      };
    }

    // Save the payment record to the database
    const paymentRecord = new Payment(paymentData);
    await paymentRecord.save();

    // Respond to the client
    res.status(201).json({
      message: "Payment processed successfully",
      data: paymentRecord,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// ----------------------- Return Payment Data Or List ------------------------------------

export const getUserPayments = async (req, res) => {
  const { email, role } = req.user; // Extract email and role from the user object.

  try {
    let combinedData = [];
    let payments = [];
    let invoices = [];

    if (role === "admin") {
      invoices = await Invoice.find();
    } else if (role === "user") {
      invoices = await Invoice.find({ email });
    }

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found. " });
    }

    // Fetch all payments matching the user's invoice IDs.
    const invoiceIds = invoices.map((invoice) => invoice.invoiceId);
    payments = await Payment.find({ invoiceId: { $in: invoiceIds } });

    const paymentMap = new Map(
      payments.map((payment) => [payment.invoiceId, payment])
    );

    // Combine invoice and payment data for both users (admin/root or user).
    combinedData = invoices.map((invoice) => {
      const payment = paymentMap.get(invoice.invoiceId);
      if (payment) {
        // If a payment exists for this invoice, use the payment data and add phone number.
        return {
          ...payment._doc, // Ensure you get the plain document
          customerPhone: invoice.phone || "N/A",
        };
      } else {
        // If no payment exists, create a "pending" payment object with invoice details.
        return {
          invoiceId: invoice.invoiceId,
          paymentId: "N/A",
          customerName: invoice.to || "N/A",
          customerPhone: invoice.phone || "N/A",
          amount: invoice.total || "N/A",
          currency: "INR",
          paymentStatus: "Pending",
          paymentDate: "N/A",
          paymentMethod: "N/A",
          cardDetails: "N/A",
        };
      }
    });

    // Return the combined data
    res.status(200).json({
      message: "Payments fetched successfully.",
      data: combinedData,
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      message: "An error occurred while fetching user payments.",
      error: error.message, // Provide error message for better debugging
    });
  }
};

// ------------------ Find Invoice By Invoice ID ----------------
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    const invoice = await Invoice.findOne({ invoiceId });
    const user = await User.findOne({ email: invoice.email });
    const payment = await Payment.findOne({ invoiceId: invoice.invoiceId });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ invoice, user, payment });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message || "Unknown error",
    });
  }
};

// ------------------ Find Payment Data By Invoice ID ----------------

export const getPaymentData = async (req, res) => {
  const { invoiceId } = req.body; // Extract invoiceId from the request body

  // Check if the invoiceId is provided in the request body
  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  try {
    // Find the payment data using the invoiceId
    const payment = await Payment.findOne({ invoiceId });

    // If no payment is found, return 404 status with a message
    if (!payment) {
      return res
        .status(404)
        .json({
          message: "Payment data not found for the provided invoice ID",
        });
    }

    // Return the found payment data
    return res.status(200).json(payment);
  } catch (error) {
    // Log the error and return a 500 status if the database query fails
    console.error("Error fetching payment data:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the payment data.",
      error: error.message || "Unknown error",
    });
  }
};

// --------------------------- Get all messages of one conversation---------------------

export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    // Check if any required field is missing
    if (!sender || !receiver) {
      return res.status(400).json({ error: "Missing Sender or Receiver" });
    }

    // Find an existing conversation between sender and receiver
    let conversation = await Message.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (conversation) {
      // Return the existing conversation
      return res.status(200).json({ conversation });
    } else {
      // Find the root admin user
      const admin = await User.findOne({ role: "admin" });

      // Logic for creating a new conversation
      let newConversation;

      if (admin && admin.email === receiver) {
        // Create a conversation with a welcome message for root admin
        newConversation = {
          sender: sender,
          receiver: receiver,
          message: [
            {
              sender: admin.email,
              msg: "Welcome to AIMPS!",
              createdAt: new Date(),
            },
          ],
        };
      } else {
        // Create an empty conversation if not root admin
        newConversation = {
          sender: sender,
          receiver: receiver,
          message: [],
        };
      }

      // Save the new conversation in the database
      conversation = new Message(newConversation);
      await conversation.save();

      return res.status(201).json({ conversation });
    }
  } catch (error) {
    console.error("Error fetching or creating conversation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// -------------------- Customer Support API -------------------------

export const newMessages = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    if (!sender || !receiver) {
      return res
        .status(400)
        .json({ error: "Missing Sender, Receiver, or Message" });
    }

    // Find an existing conversation between sender and receiver
    let conversation = await Message.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    // If conversation exists, add the new message to the conversation's message array
    if (conversation) {
      const currentTime = new Date(); // Create a valid Date object

      // Add each message to the conversation
      if (message.length === 0) {
        return res.status(500).json({ error: " Message Cant Empty" });
      } else {
        message.forEach((msg) => {
          conversation.message.push({
            msg: msg.msg,
            createdAt: currentTime, // Store a Date object
            sender: msg.sender,
          });
        });
      }

      // Save the updated conversation
      await conversation.save();
      return res
        .status(200)
        .json({ message: "Message(s) added to existing conversation" });
    } else {
      // If no conversation exists, create a new conversation
      const currentTime = new Date(); // Create a valid Date object

      const newConversation = new Message({
        sender,
        receiver,
        message: message.map((msg) => ({
          msg: msg.msg,
          createdAt: currentTime, // Store a Date object
          sender: msg.sender,
        })),
      });

      // Save the new conversation
      await newConversation.save();
      return res
        .status(201)
        .json({ message: "New conversation created and message(s) added" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error adding message", details: error.message });
  }
};

export const sendOtp = async (req, res) => {
  const { email, newUser } = req.body;
  console.log(req.body);

  if (!email) return res.status(400).json({ message: "Email is required" });

  if (!newUser) {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Store OTP with an expiration time (5 minutes)
  otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log(req.body);
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const otpString = Array.isArray(otp) ? otp.join("") : otp;
  const storedOtp = otpStorage[email];
  if (!storedOtp) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }
  if (Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }
  if (storedOtp.otp !== otpString) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // OTP is valid, remove it from storage
  delete otpStorage[email];
  res.json({ message: "OTP verified successfully" });
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    console.log(user);
    await user.save();
    console.log("abc");

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

export const addUserOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  // Check if the user is already added
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "This email is already added" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store OTP with an expiration time (5 minutes)
    addUserOtpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

export const addUserVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const otpString = Array.isArray(otp) ? otp.join("") : otp;
  const addUserStoredOtp = addUserOtpStorage[email];
  if (!addUserStoredOtp) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }
  if (Date.now() > addUserStoredOtp.expiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }
  if (addUserStoredOtp.otp !== otpString) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // OTP is valid, remove it from storage
  delete addUserOtpStorage[email];
  res.json({ message: "OTP verified successfully" });
};
