// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const generateDefaultProfilePicture = (username) => {
  
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;
};

/**
 * @route   POST /api/auth
 * @desc    Register a new user (automatically assigns default profile picture)
 * @access  Public
 */
export async function POST(request) {
  await connectToDatabase();

  try {
    const { username, email, password, university, major, year } = await request.json();

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 400 });
    }

    user = new User({
      username,
      email,
      password,
      university,
      major,
      year,
      // Call the function to generate a dynamic profile picture based on username
      profilePicture: generateDefaultProfilePicture(username), 
    });

    await user.save();

    const token = generateToken(user._id);

    return NextResponse.json({
      message: 'Registration successful!',
      token,
      user: { id: user._id, username: user.username, email: user.email, isVerified: user.isVerified, profilePicture: user.profilePicture } // Include profilePicture in response
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error.message);
    return NextResponse.json({ message: 'Server Error during registration' }, { status: 500 });
  }
}

/**
 * @route   PATCH /api/auth
 * @desc    Authenticate user & get token (login)
 * @access  Public
 */
export async function PATCH(request) {
  await connectToDatabase();

  try {
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const token = generateToken(user._id);

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        university: user.university,
        major: user.major,
        reputationScore: user.reputationScore,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture, // Ensure profilePicture is included in login response
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json({ message: 'Server Error during login' }, { status: 500 });
  }
}
