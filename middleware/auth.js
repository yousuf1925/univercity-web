// src/middleware/auth.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb'; // Import your MongoDB connection utility
import User from '@/models/User';              // Import your User model

/**
 * Middleware function to protect API routes.
 * It checks for a valid JWT in the Authorization header.
 * If valid, it returns the authenticated user object.
 * If invalid or missing, it returns a NextResponse error.
 *
 * @param {Request} request The incoming Next.js request object.
 * @returns {User|NextResponse} The authenticated user object or a NextResponse error.
 */
export async function protect(request) {
  // Ensure the database connection is established before proceeding
  await connectToDatabase();

  let token;
  // Get the Authorization header from the request
  const authHeader = request.headers.get('authorization');

  // Check if the header exists and starts with 'Bearer'
  if (authHeader && authHeader.startsWith('Bearer')) {
    // Extract the token string (remove 'Bearer ' prefix)
    token = authHeader.split(' ')[1];
  }

  // If no token is found, return an unauthorized response
  if (!token) {
    return NextResponse.json({ message: 'Not authorized, no token' }, { status: 401 });
  }

  try {
    // Verify the token using your JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database based on the ID extracted from the token.
    // .select('-password') excludes the password hash from the returned user object.
    const user = await User.findById(decoded.id).select('-password');

    // If no user is found for the given ID (e.g., user deleted), return unauthorized
    if (!user) {
      return NextResponse.json({ message: 'Not authorized, user not found' }, { status: 401 });
    }

    // If the token is valid and user is found, return the user object.
    // This user object will then be used by the route handler.
    return user;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Token verification error:', error.message);
    // Return an unauthorized response if token verification fails
    return NextResponse.json({ message: 'Not authorized, token failed' }, { status: 401 });
  }
}
