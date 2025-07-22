// src/app/api/answers/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

// Add answer
export async function POST(request) {
  try {
    const authUser = await protect(request);
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    await connectToDatabase();

    const { questionId, content } = await request.json();

    if (!questionId || !content) {
      return NextResponse.json({ message: 'Question ID and content are required.' }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    const newAnswer = new Answer({
      question: questionId,
      content,
      author: authUser._id,
    });

    const answer = await newAnswer.save();

    question.answersCount += 1;
    await question.save();

    await User.findByIdAndUpdate(authUser._id, { $inc: { answersGiven: 1 } });

    return NextResponse.json(answer, { status: 201 });

  } catch (error) {
    console.error('Create answer error:', error);
    return NextResponse.json({ message: 'Server Error: Failed to post answer' }, { status: 500 });
  }
}
