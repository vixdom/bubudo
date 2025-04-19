import { supabase } from '../index.js';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) throw authError;

    // Create user profile in the database
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) throw userError;

    // Generate JWT tokens
    const accessToken = generateAccessToken(authData.user.id);
    const refreshToken = generateRefreshToken(authData.user.id);

    res.status(201).json({
      id: authData.user.id,
      name,
      email,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    // Generate JWT tokens
    const accessToken = generateAccessToken(authData.user.id);
    const refreshToken = generateRefreshToken(authData.user.id);

    res.status(200).json({
      id: authData.user.id,
      name: userData.name,
      email: authData.user.email,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: error.message });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    
    // Update profile in Supabase
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
      
      const accessToken = generateAccessToken(decoded.id);
      
      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
};
