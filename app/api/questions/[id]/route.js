// src/app/api/questions/[id]/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';
import Answer from '@/models/Answer'; // Needed for cascading delete of answers
import { protect } from '@/middleware/auth';

/**
 * @route   GET /api/questions/:id
 * @desc    Get a single question by ID
 * @access  Public
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} { params } Contains dynamic route parameters, e.g., { id: questionId }.
 */
export async function GET(request, { params }) {
  await connectToDatabase();

  try {
    const questionId = params.id; // Get the question ID from the URL

    // FIX: Using findOne explicitly to avoid any potential implicit sort issues.
    // Also, added .lean() for potentially faster reads if we don't need Mongoose Document methods later.
    const question = await Question.findOne({ _id: questionId })
                                  .populate('author', 'username profilePicture university reputationScore')
                                  .lean(); // Convert to plain JavaScript object for performance

    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Increment view count directly on the model, outside the .lean() chain if it causes issues.
    // This requires fetching the document again if .lean() was used and modifications are needed.
    // Alternatively, if .lean() isn't strictly necessary, remove it.
    // For view count, let's stick to the non-lean approach to save and keep it simple.
    // If you remove .lean(), the `question.views += 1; await question.save();` lines will work directly.

    // Re-fetching without .lean() to allow direct modification and saving
    const liveQuestion = await Question.findById(questionId);
    if (liveQuestion) {
        liveQuestion.views += 1;
        await liveQuestion.save();
    }


    // Return the found question (using the initially fetched `question` for response)
    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error(`Get single question error for ID ${params.id}:`, error); // More specific logging
    // Check if the error is a CastError, which means the ID format is wrong
    if (error.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid question ID format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server Error: Failed to fetch question' }, { status: 500 });
  }
}

/**
 * @route   PUT /api/questions/:id
 * @desc    Update a question
 * @access  Private (only author can update)
 */
export async function PUT(request, { params }) {
  // Authenticate the user
  const authUser = await protect(request);
  if (authUser instanceof NextResponse) {
    return authUser;
  }

  await connectToDatabase();

  try {
    const questionId = params.id;
    const { title, content, majorTags, generalTags } = await request.json();

    let question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    if (question.author.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Not authorized to update this question' }, { status: 403 });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.majorTags = majorTags || question.majorTags;
    question.generalTags = generalTags || question.generalTags;

    await question.save();
    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error(`Update question error for ID ${params.id}:`, error);
    if (error.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid question ID format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server Error: Failed to update question' }, { status: 500 });
  }
}

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question
 * @access  Private (only author can delete)
 */
export async function DELETE(request, { params }) {
  // Authenticate the user
  const authUser = await protect(request);
  if (authUser instanceof NextResponse) {
    return authUser;
  }

  await connectToDatabase();

  try {
    const questionId = params.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    if (question.author.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Not authorized to delete this question' }, { status: 403 });
    }

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await User.findByIdAndUpdate(authUser.id, { $inc: { questionsAsked: -1 } });

    return NextResponse.json({ message: 'Question and associated answers removed successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Delete question error for ID ${params.id}:`, error);
    if (error.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid question ID format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server Error: Failed to delete question' }, { status: 500 });
  }
}
