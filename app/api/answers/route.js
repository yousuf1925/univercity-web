// src/app/api/answers/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question'; // To update answersCount on Question
import User from '@/models/User';         // To update answersGiven on User
import { protect } from '@/middleware/auth';

/**
 * @route   POST /api/answers/
 * @desc    Add an answer (comment) to a specific question
 * @access  Private
 */
export async function POST(request) {
  try {
    // 1. Authenticate the user
    const authUser = await protect(request);
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    // 2. Ensure database connection
    await connectToDatabase();

    // 3. Parse request body (expecting questionId and content)
    const { questionId, content } = await request.json();

    // 4. Basic validation
    if (!questionId || !content) {
      return NextResponse.json({ message: 'Question ID and content are required.' }, { status: 400 });
    }

    // 5. Verify the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // 6. Create new Answer instance
    const newAnswer = new Answer({
      question: questionId,
      content,
      author: authUser._id, // Author is the authenticated user
    });

    // 7. Save the answer
    const answer = await newAnswer.save();

    // 8. Increment answersCount on the parent Question
    question.answersCount += 1;
    await question.save();

    // 9. Increment answersGiven count for the User
    await User.findByIdAndUpdate(authUser._id, { $inc: { answersGiven: 1 } });

    // 10. Return the created answer
    return NextResponse.json(answer, { status: 201 });

  } catch (error) {
    console.error('Create answer error:', error);
    return NextResponse.json({ message: 'Server Error: Failed to post answer' }, { status: 500 });
  }
}

// NOTE: PUT and DELETE /api/answers/:id routes (for updating/deleting specific answers)
// are typically in src/app/api/answers/[id]/route.js.
// If you want a GET all answers for a question, it's typically a separate route.
