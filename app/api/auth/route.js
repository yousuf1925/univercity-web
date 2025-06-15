// src/app/api/auth/route.js
// This file handles both user registration (POST) and login (PATCH) requests.

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // Import your DB connection utility
import User from '@/models/User';              // Import your User model
import jwt from 'jsonwebtoken';
// bcryptjs is used by the User model's pre-save hook and comparePassword method,
// so it's not explicitly imported here but its functionality is used.

// Helper function to generate a JSON Web Token (JWT)
const generateToken = (id) => {
  // Sign the token with the user's ID, your secret key, and an expiration time
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token will be valid for 1 hour
  });
};

/**
 * @route   POST /api/auth
 * @desc    Register a new user (no email verification for simplicity)
 * @access  Public
 */
export async function POST(request) {
  await connectToDatabase(); // Establish connection to MongoDB

  try {
    // Parse the request body to get user data
    const { username, email, password, university, major, year } = await request.json();

    // Check if a user with the given email or username already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      // If user exists, return a 400 Bad Request response
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 400 });
    }

    // Create a new User instance with the provided data.
    // The pre-save hook in the User model will automatically hash the password.
    user = new User({
      username,
      email,
      password,
      university,
      major,
      year,
      // isVerified defaults to true in the User model schema
    });

    // Save the new user to the database
    await user.save();

    // Generate a JWT for the newly registered user for immediate login
    const token = generateToken(user._id);

    // Return a 201 Created response with success message, token, and user info
    return NextResponse.json({
      message: 'Registration successful!',
      token, // Send the JWT back to the client
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified, // This will be true
      }
    }, { status: 201 });

  } catch (error) {
    // Log any errors that occur during the registration process
    console.error('Registration error:', error.message);
    // Return a 500 Internal Server Error response
    return NextResponse.json({ message: 'Server Error during registration' }, { status: 500 });
  }
}

/**
 * @route   PATCH /api/auth
 * @desc    Authenticate user & get token (login)
 * @access  Public
 *
 * Using PATCH here to differentiate from POST (registration) within the same route.js file.
 * You could also create a separate folder like src/app/api/auth/login/route.js and use POST there.
 */
export async function PATCH(request) {
  await connectToDatabase(); // Establish connection to MongoDB

  try {
    // Parse the request body to get email and password
    const { email, password } = await request.json();

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      // If user not found, return a 400 Bad Request response with a generic message
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // No `isVerified` check needed as per your requirement to skip verification

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // If passwords don't match, return a 400 Bad Request response with a generic message
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // If credentials are valid, generate a JWT
    const token = generateToken(user._id);

    // Return a 200 OK response with the JWT and user information
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        university: user.university,
        major: user.major,
        reputationScore: user.reputationScore,
        isVerified: user.isVerified, // Will be true
      },
    }, { status: 200 });

  } catch (error) {
    // Log any errors that occur during the login process
    console.error('Login error:', error.message);
    // Return a 500 Internal Server Error response
    return NextResponse.json({ message: 'Server Error during login' }, { status: 500 });
  }
}
