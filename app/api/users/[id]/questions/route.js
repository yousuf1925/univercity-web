// src/app/api/questions/[id]/route.js  <-- THIS IS THE FILE YOU NEED TO CREATE/MODIFY
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer'; // Assuming you have an Answer model
import User from '@/models/User';    // Assuming you need to update User model counts
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth'; // Your authentication middleware

/**
 * @route   GET /api/questions/:id
 * @desc    Get a single question by ID
 * @access  Public
 */
export async function GET(request, { params }) {
  await connectToDatabase();
  const questionId = params.id;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return NextResponse.json({ message: 'Invalid question ID format' }, { status: 400 });
  }

  try {
    const question = await Question.findById(questionId).populate('author', 'username profilePicture university'); // Populate author details

    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Optionally increment views here or on frontend
    question.views += 1;
    await question.save();

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question by ID (and associated answers)
 * @access  Private (only author can delete)
 */
export async function DELETE(request, { params }) {
  await connectToDatabase();
  const questionId = params.id;

  // 1. Authenticate the user
  const authUser = await protect(request);
  if (authUser instanceof NextResponse) {
    return authUser; // Unauthorized or token expired
  }

  // Validate question ID format
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return NextResponse.json({ message: 'Invalid question ID format' }, { status: 400 });
  }

  try {
    // Find the question
    const question = await Question.findById(questionId);

    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Check if the authenticated user is the author of the question
    if (question.author.toString() !== authUser.id.toString()) {
      return NextResponse.json({ message: 'Not authorized to delete this question' }, { status: 403 });
    }

    // --- Perform Deletion ---

    // 1. Delete associated answers (if any)
    await Answer.deleteMany({ question: questionId });

    // 2. Decrement questionsAsked count for the author
    await User.findByIdAndUpdate(
      authUser.id,
      { $inc: { questionsAsked: -1 } },
      { new: true } // Return the updated document
    );

    // 3. Delete the question itself
    await question.deleteOne(); // Or findByIdAndDelete(questionId)

    return NextResponse.json({ message: 'Question and associated answers deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// You can add PUT and POST methods here if needed for /api/questions/:id or /api/questions
// export async function PUT(...) { ... }
// export async function POST(...) { ... } // If you handle creation at /api/questions/