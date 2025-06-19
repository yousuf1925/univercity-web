// src/app/api/users/[id]/questions/route.js  <-- THIS IS THE FILE YOU NEED TO CREATE/MOVE
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import mongoose from 'mongoose'; // To validate ObjectId

/**
 * @route   GET /api/users/:id/questions
 * @desc    Get all questions asked by a specific user
 * @access  Public (or Private if you prefer questions to be private)
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} { params } Contains dynamic route parameters, e.g., { id: userId }.
 */
export async function GET(request, { params }) {
  await connectToDatabase();

  const userId = params.id;

  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    // Find all questions where the author field matches the userId
    // Ensure you select all fields needed by the frontend (title, content, createdAt, views, answersCount, majorTags)
    const questions = await Question.find({ author: userId })
                                    .sort({ createdAt: -1 })
                                    .select('title content createdAt views answersCount majorTags');

    return NextResponse.json(questions, { status: 200 });

  } catch (error) {
    console.error('Error fetching user questions:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to fetch user questions' }, { status: 500 });
  }
}