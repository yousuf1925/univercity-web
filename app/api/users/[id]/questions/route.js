// src/app/api/users/[id]/questions/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import mongoose from 'mongoose';


export async function GET(request, { params }) {
  await connectToDatabase();
  const userId = params.id; // This 'id' is the USER ID from the URL

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const questions = await Question.find({ author: userId }) // Filter by the 'author' field
      .sort({ createdAt: -1 }) // Sort by most recent
      .populate('author', 'username profilePicture university reputationScore') 
      .select('title content createdAt views answersCount majorTags'); 

    return NextResponse.json(questions, { status: 200 });

  } catch (error) {
    console.error(`Error fetching questions for user ${userId}:`, error);
    if (error.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid user ID provided.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error: Failed to fetch user questions' }, { status: 500 });
  }
}