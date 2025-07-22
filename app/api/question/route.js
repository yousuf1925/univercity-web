// src/app/api/post/route.js
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import { NextResponse } from 'next/server';

// Create question
export async function POST(req) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const newQuestion = new Question(body);
    const savedQuestion = await newQuestion.save();

    return NextResponse.json(
      { message: 'Question created successfully', question: savedQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create question:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { message: 'Validation Error', errors: errors },
        { status: 400 }
      );
    } else if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Duplicate key error. A resource with this unique identifier already exists.', error: error.message },
        { status: 409 }
      );
    } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return NextResponse.json(
        { message: `Invalid ID format for ${error.path}. Please provide a valid ObjectId.`, error: error.message },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
  }
}
