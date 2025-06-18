// src/app/api/users/[id]/route.js  <-- THIS IS THE NEW/CORRECT FILE FOR USER PROFILES
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // Ensure this path is correct
import User from '@/models/User'; // Your Mongoose User model
import mongoose from 'mongoose'; // To validate ObjectId

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user profile by ID (for public viewing)
 * @access  Public (sensitive data excluded)
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} { params } Contains dynamic route parameters, e.g., { id: userId }.
 */
export async function GET(request, { params }) {
  await connectToDatabase();

  const userId = params.id; // Get the user ID from the URL

  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    // Find the user by ID and select specific fields for public viewing.
    // ALWAYS EXCLUDE 'password'. Consider excluding 'email' for public profiles.
    const user = await User.findById(userId).select('username university major year profilePicture reputationScore questionsAsked answersGiven createdAt');
    // Adjust the .select() part based on what you consider public information.
    // For instance, 'profilePicture', 'reputationScore', 'questionsAsked', 'answersGiven' might be relevant.

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Respond with the found user data
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Get public user profile error:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to fetch user profile' }, { status: 500 });
  }
}

// You can add PUT/DELETE methods here for user management if needed,
// but they would likely require administrative or self-user authorization.
// For example, a PUT method for a user to update their OWN profile (different from /api/profile which is current user).
// Or a DELETE method for a user to delete their OWN account.
// These would be different from the GET request which is for public viewing.