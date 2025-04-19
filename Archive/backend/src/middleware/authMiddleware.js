import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';

export default async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Check if user exists in Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', decoded.id)
      .single();
    
    if (error || !profile) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = profile;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
