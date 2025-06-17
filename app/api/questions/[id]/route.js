// src/app/api/questions/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // Corrected alias import
import Question from '@/models/Question';      // Corrected alias import
import User from '@/models/User';              // Corrected alias import
import { protect } from '@/middleware/auth';    // Corrected alias import

/**
 * @route   POST /api/questions
 * @desc    Create a new question
 * @access  Private (requires authentication)
 */
export async function POST(request) {
  try { // Wrap the entire POST handler in a try-catch for robust error handling
    // 1. Authenticate the user. If not authenticated, protect() returns an error response.
    const authUser = await protect(request);
    // Check if protect() returned a NextResponse (indicating an error)
    if (authUser instanceof NextResponse) {
      return authUser; // Return the error response immediately
    }
    // At this point, authUser is guaranteed to be the user object if authentication was successful.

    // 2. Ensure database connection is established
    await connectToDatabase();

    // 3. Parse the request body to get question data
    const { title, content } = await request.json();

    // 4. Basic server-side validation
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required.' },
        { status: 400 }
      );
    }

    // 5. Ensure user's university data is available
    if (!authUser.university) {
        // This is a critical check. If a user somehow doesn't have a university, prevent question creation.
        return NextResponse.json(
            { message: 'User university information missing. Cannot post question.' },
            { status: 400 }
        );
    }

    // 6. Create a new Question instance
    const newQuestion = new Question({
      title,
      content,
      author: authUser._id, // Use authUser._id (Mongoose object) or authUser.id (plain string)
      university: authUser.university, // Get university from the authenticated user's profile
      majorTags: [], // Default to empty array as not provided by frontend
      generalTags: [], // Default to empty array as not provided by frontend
    });

    // 7. Save the new question to the database
    const question = await newQuestion.save();

    // 8. Update the author's questionsAsked count
    await User.findByIdAndUpdate(authUser._id, { $inc: { questionsAsked: 1 } });

    // 9. Respond with the created question and a 201 status
    return NextResponse.json(question, { status: 201 });

  } catch (error) {
    console.error('Create question error (backend):', error); // Log the full error object
    // Return a generic server error response, or a more specific one if desired
    return NextResponse.json({ message: 'Server Error: Failed to create question' }, { status: 500 });
  }
}

/**
 * @route   GET /api/questions
 * @desc    Get a list of all questions (with filtering, sorting, pagination)
 * @access  Public
 */
export async function GET(request) {
  await connectToDatabase(); // Ensure database connection is established

  try {
    // 1. Parse URL query parameters for filtering, sorting, and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const university = searchParams.get('university'); // Keep for potential future filtering
    const major = searchParams.get('major');           // Keep for potential future filtering
    const tag = searchParams.get('tag');               // Keep for potential future filtering

    const query = {}; // MongoDB query object

    // Add search filter (case-insensitive regex for title and content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    // Add university filter
    if (university) {
      query.university = university;
    }
    // Add major tag filter
    if (major) {
      query.majorTags = major;
    }
    // Add general tag filter
    if (tag) {
      query.$or = [{ majorTags: tag }, { generalTags: tag }];
    }

    let sortOptions = { createdAt: -1 }; // Default sort: newest first
    // Add sorting options
    if (sort === 'views') {
      sortOptions = { views: -1 }; // Sort by most views
    }
    // You can add more sort options like 'answers' (answersCount: -1) here

    // 2. Fetch questions from the database
    const questions = await Question.find(query)
      .populate('author', 'username profilePicture university reputationScore') // Populate author details
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit); // Apply pagination

    // 3. Get total count of questions matching the query for pagination metadata
    const totalQuestions = await Question.countDocuments(query);

    // 4. Respond with questions and pagination metadata
    return NextResponse.json({
      questions,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: page,
      totalCount: totalQuestions
    }, { status: 200 });

  } catch (error) {
    console.error('Get questions error:', error.message);
    return NextResponse.json({ message: 'Server Error: Failed to fetch questions' }, { status: 500 });
  }
}
