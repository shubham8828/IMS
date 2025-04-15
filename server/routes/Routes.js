import express from 'express';
import AuthenticateToken from '../Middleware/AuthenticateToken.js';
import {
  deleteInvoice,
  invoices,
  newInvoive,
  searchCustomer,
  updateInvoice,
  getUser,
  login,
  AddUser,
  update,
  makePayment,
  newMessages,
  getUserPayments,
  getInvoice,
  getMessages,
  getUsers,
  deleteUser,
  sendOtp,
  verifyOtp,
  resetPassword,
 addUserOtp,
 addUserVerifyOtp
} from '../controller/Controller.js';


const Routes = express.Router();

Routes.post('/login', login);
Routes.post('/send-otp',sendOtp)
Routes.post('/verify-otp',verifyOtp)
Routes.post('/reset-password',resetPassword)


Routes.use(AuthenticateToken);

Routes.post('/user/add/sendOtp',addUserOtp)
Routes.post('/user/add/verifyOtp',addUserVerifyOtp)
Routes.get('/user/current', getUser);
Routes.post('/user/add', AddUser);
Routes.delete('/user/delete/:id', deleteUser);
Routes.put('/user/update', update); // update user profile
Routes.get('/user/all', getUsers);
Routes.get('/user/search', searchCustomer); // for searching customers

Routes.post('/invoice/new', newInvoive);
Routes.get('/invoice/all', invoices);
Routes.delete('/invoice/delete/:id', deleteInvoice);
Routes.post('/invoice/get', getInvoice);

Routes.put('/invoice/update', updateInvoice); // This API is not in currentaly 


Routes.post('/payment/new', makePayment);
Routes.get('/payment/get', getUserPayments);

Routes.post('/message/all', getMessages);
Routes.post('/message/new', newMessages);

export default Routes;
