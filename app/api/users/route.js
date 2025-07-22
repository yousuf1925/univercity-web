// src/app/api/questions/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function POST(request) {
  try {
    const authUser = await protect(request);
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    await connectToDatabase();

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required.' },
        { status: 400 }
      );
    }

    if (!authUser.university) {
      return NextResponse.json(
        { message: 'User university information missing. Cannot post question.' },
        { status: 400 }
      );
    }

    const newQuestion = new Question({
      title,
      content,
      author: authUser._id,
      university: authUser.university,
      majorTags: [],
      generalTags: [],
    });

    const question = await newQuestion.save();

    await User.findByIdAndUpdate(authUser._id, { $inc: { questionsAsked: 1 } });

    return NextResponse.json(question, { status: 201 });

  } catch (error) {
    console.error('Create question error (backend):', error);
    return NextResponse.json({ message: 'Server Error: Failed to create question' }, { status: 500 });
  }
}

// Get questions
export async function GET(request) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const university = searchParams.get('university');
    const major = searchParams.get('major');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort');

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (university) {
      query.university = university;
    }

    if (major) {
      query.majorTags = major;
    }

    if (tag) {
      query.$or = [{ majorTags: tag }, { generalTags: tag }];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'views') {
      sortOptions = { views: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username profilePicture university reputationScore')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalQuestions = await Question.countDocuments(query);

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
