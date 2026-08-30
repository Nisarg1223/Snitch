import UserModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

async function sendTokenRequest(user, res, message) {
  const Token = jwt.sign({
    id: user._id
  }, config.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.cookie("token", Token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    message,
    success: true,
    Token,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
      avatar: user.avatar
    }
  });
}

export async function RegisterController(req, res) {
  const { email, password, fullname, contact, isSeller } = req.body;

  try {
    const existUser = await UserModel.findOne({
      $or: [
        { email },
        { contact }
      ]
    });

    if (existUser) {
      return res.status(400).json({
        message: "user already exists"
      });
    }
    const user = await UserModel.create({
      email,
      password,
      fullname,
      contact,
      role: isSeller ? "seller" : "buyer",
    });

    await sendTokenRequest(user, res, "user register successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}

export async function LoginController(req, res) {
  const { email, password } = req.body;

  try {
    const userExists = await UserModel.findOne({ email });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "The user is not found"
      });
    }

    const isMatch = await userExists.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    await sendTokenRequest(userExists, res, "User logged in successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
}

export async function googleCallback(req, res) {
  try {
    const profile = req.user;

    if (!profile || !profile.emails || !profile.emails[0]) {
      return res.redirect('http://localhost:5173/login?error=Google authentication failed');
    }

    const email = profile.emails[0].value;
    let user = await UserModel.findOne({
      $or: [
        { googleId: profile.id },
        { email }
      ]
    });

    if (user) {
      let needsSave = false;

      if (!user.googleId) {
        user.googleId = profile.id;
        needsSave = true;
      }

      if (!user.avatar && profile.photos?.[0]?.value) {
        user.avatar = profile.photos[0].value;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    } else {
      user = await UserModel.create({
        email,
        fullname: profile.displayName || email.split('@')[0],
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || '',
        role: 'buyer',
        contact: ''
      });
    }

    const Token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
    const userData = {
      id: user._id,
      email: user.email,
      contact: user.contact || '',
      fullname: user.fullname,
      role: user.role,
      avatar: user.avatar || ''
    };

    const userParam = encodeURIComponent(JSON.stringify(userData));
    return res.redirect(`http://localhost:5173/?token=${Token}&user=${userParam}`);
  } catch (error) {
    console.error('Google Auth Callback Error:', error);
    return res.redirect('http://localhost:5173/login?error=Authentication failed');
  }
}

export async function getMeController(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "") || req.query.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname || user.displayName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error("getMeController error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

export async function LogoutController(req, res) {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

