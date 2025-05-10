const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, walletAddress: user.walletAddress },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { walletAddress, username } = req.body;
    
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({
        walletAddress,
        username
      });
    }

    const token = generateToken(user);
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        currentGroup: user.currentGroup
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        currentGroup: user.currentGroup
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};