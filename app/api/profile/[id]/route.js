// src/app/api/profile/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

// Get user profile
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

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Authenticated user profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error while fetching authenticated profile' }, { status: 500 });
  }
}
