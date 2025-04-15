import jwt from 'jsonwebtoken';

const AuthenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Token format: "Bearer token"
  if (!token) {
    return res.status(401).json({ message: 'Authentication failed, token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Store decoded token payload in `req.user`
    next(); // Call the next middleware or function
  });
};
  
export default AuthenticateToken;