// src/app/api/post/route.js
import connectToDatabase from '@/lib/mongodb'; // Adjust path based on your db connection file
import Question from '@/models/Question';      // Adjust path to your Question model
import { NextResponse } from 'next/server';

/**
 * Handles POST requests to create a new Question (referred to as a "Post" in your folder structure).
 * This route expects a JSON body containing the question data.
 *
 * @param {Request} req The incoming Next.js request object.
 * @returns {NextResponse} The Next.js response object with the created question or an error.
 */
export async function POST(req) {
  // Establish connection to MongoDB using your connectToDatabase utility
  await connectToDatabase();

  try {
    // Parse the JSON body from the request
    const body = await req.json();

    // Create a new Question instance using the parsed data.
    // Ensure that the 'author' field in the body is a valid MongoDB ObjectId string.
    // In a production application, the 'author' ID would typically come from an authenticated
    // user's session or token, not directly from the request body for security.
    const newQuestion = new Question(body);

    // Save the new question document to the database
    const savedQuestion = await newQuestion.save();

    // Return a success response with a 201 (Created) status
    return NextResponse.json(
      { message: 'Question created successfully', question: savedQuestion },
      { status: 201 }
    );
  } catch (error) {
    // Log the full error for debugging on the server side
    console.error('Failed to create question:', error);

    // --- Error Handling Logic ---
    // Handle Mongoose validation errors (e.g., missing required fields, type mismatches)
    if (error.name === 'ValidationError') {
      // Extract validation error messages (e.g., from error.errors) if needed
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { message: 'Validation Error', errors: errors },
        { status: 400 } // 400 Bad Request
      );
    }
    // Handle specific MongoDB errors, e.g., duplicate key error (code 11000)
    else if (error.code === 11000) {
        return NextResponse.json(
            { message: 'Duplicate key error. A resource with this unique identifier already exists.', error: error.message },
            { status: 409 } // 409 Conflict
        );
    }
    // Handle CastError if an invalid ObjectId format is provided for a ref field like 'author'
    else if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return NextResponse.json(
            { message: `Invalid ID format for ${error.path}. Please provide a valid ObjectId.`, error: error.message },
            { status: 400 }
        );
    }
    // Catch any other unexpected errors
    else {
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 } // 500 Internal Server Error
      );
    }
  }
}

// You can add other HTTP methods (GET, PUT, DELETE) here if your API needs to
// support those operations for a single "post" resource or a collection of "posts".
// For example, to get all posts:
/*
export async function GET(req) {
  await connectToDatabase();
  try {
    const questions = await Question.find({}); // Fetch all questions
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
*/
