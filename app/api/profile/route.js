
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; 
import User from '@/models/User';
import { protect } from '@/middleware/auth'; 

/**
 * @route   GET /api/profile
 * @desc    Get the profile of the currently authenticated user
 * @access  Private
 * @param {Request} request The incoming Next.js request object.
 */
export async function GET(request) {

  const authUser = await protect(request);
  if (authUser instanceof NextResponse) {
    return authUser;
  }

  await connectToDatabase();

  try {
    
    const user = await User.findById(authUser.id).select('-password');

    if (!user) {
      
      return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
    }

    // 4. Return the user data (all non-sensitive fields)
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Authenticated user profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error while fetching authenticated profile' }, { status: 500 });
  }
}