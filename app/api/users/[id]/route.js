// src/app/api/users/[id]/questions/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  await connectToDatabase();
  const userId = params.id; // This is the user ID

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const questions = await Question.find({ author: userId }) // Find questions by this author
      .sort({ createdAt: -1 })
      .select('title content createdAt views answersCount majorTags');

    // It's possible for a user to have no questions, which is fine.
    // It will return an empty array, not null. So no 404 here needed if array is empty.
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching user questions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}