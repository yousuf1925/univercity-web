// src/app/api/profile/route.js  <-- This is where the authenticated user fetches THEIR OWN profile
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // Make sure this path is correct
import User from '@/models/User';
import { protect } from '@/middleware/auth'; // Your authentication middleware

/**
 * @route   GET /api/profile
 * @desc    Get the profile of the currently authenticated user
 * @access  Private
 * @param {Request} request The incoming Next.js request object.
 */
export async function GET(request) {
  // 1. Authenticate the user
  const authUser = await protect(request);
  if (authUser instanceof NextResponse) {
    // If protect returns a NextResponse, it means authentication failed
    return authUser;
  }

  // 2. Connect to the database
  await connectToDatabase();

  try {
    // 3. Find the user by their ID (from the authenticated token), excluding the password hash
    const user = await User.findById(authUser.id).select('-password');

    if (!user) {
      // This case should theoretically not happen if authUser.id is valid and from a current user
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }

    // 4. Return the user data (all non-sensitive fields)
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Authenticated user profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error while fetching authenticated profile' }, { status: 500 });
  }
}