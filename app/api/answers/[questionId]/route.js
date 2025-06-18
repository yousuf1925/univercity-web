import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Answer from '@/models/Answer';

export async function GET(request, { params }) {
  await connectToDatabase();

  try {
    const { questionId } = await params;;

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'username profilePicture reputationScore university')
      .sort({ createdAt: 1 });

    return NextResponse.json(answers, { status: 200 });
  } catch (error) {
    console.error('Get answers error:', error);
    return NextResponse.json({ message: 'Server Error: Failed to fetch answers' }, { status: 500 });
  }
}
