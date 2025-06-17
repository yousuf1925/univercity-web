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

    // Find the question by ID and populate its author details
    const question = await Question.findById(questionId)
                                  .populate('author', 'username profilePicture university reputationScore');
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Increment view count (consider adding debouncing logic in a real-world app
    // to prevent rapid-fire view increments from single user refreshing)
    question.views += 1;
    await question.save();

    // Respond with the found question
    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error('Get single question error:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to fetch question' }, { status: 500 });
  }
}

/**
 * @route   PUT /api/questions/:id
 * @desc    Update a question
 * @access  Private (only author can update)
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} { params } Contains dynamic route parameters, e.g., { id: questionId }.
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

    // Check if the authenticated user is the author of the question
    if (question.author.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Not authorized to update this question' }, { status: 403 });
    }

    // Update question fields if provided in the request body
    question.title = title || question.title;
    question.content = content || question.content;
    question.majorTags = majorTags || question.majorTags;
    question.generalTags = generalTags || question.generalTags;
    // You might also want to update the 'updatedAt' timestamp manually if you have custom logic,
    // though Mongoose's `timestamps: true` handles this on save.

    await question.save(); // Save the updated question
    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error('Update question error:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to update question' }, { status: 500 });
  }
}

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question
 * @access  Private (only author can delete)
 * @param {Request} request The incoming Next.js request object.
 * @param {Object} { params } Contains dynamic route parameters, e.g., { id: questionId }.
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

    // Check if the authenticated user is the author of the question
    if (question.author.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Not authorized to delete this question' }, { status: 403 });
    }

    // Delete the question
    await Question.deleteOne({ _id: questionId });

    // IMPORTANT: Also delete all answers associated with this question to maintain data integrity
    await Answer.deleteMany({ question: questionId });

    // Decrement the questionsAsked count for the author
    await User.findByIdAndUpdate(authUser.id, { $inc: { questionsAsked: -1 } });

    return NextResponse.json({ message: 'Question and associated answers removed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete question error:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to delete question' }, { status: 500 });
  }
}
