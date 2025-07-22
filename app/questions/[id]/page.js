// src/app/questions/[id]/page.js
'use client'; // This is a client component as it fetches data on the client-side

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Import AuthContext for login check
import AnswerCard from '../../components/AnswerCard'; // Import the AnswerCard component

export default function SingleQuestionPage() {
  const params = useParams(); 
  const router = useRouter(); 
  const questionId = params.id; 
  const { isLoggedIn, token } = useAuth();
  const [question, setQuestion] = useState(null); 
  const [answers, setAnswers] = useState([]); 
  const [newAnswerContent, setNewAnswerContent] = useState(''); 

  const [loadingQuestion, setLoadingQuestion] = useState(true); 
  const [loadingAnswers, setLoadingAnswers] = useState(true);   
  const [questionError, setQuestionError] = useState('');       
  const [answerError, setAnswerError] = useState('');           
  const [postAnswerLoading, setPostAnswerLoading] = useState(false); // Loading state for posting new answer


  // --- Function to fetch the main question details ---
  const fetchQuestion = async () => {
    setLoadingQuestion(true);
    setQuestionError('');
    try {
      // Make API call to fetch a single question by its ID
      const response = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setQuestionError(data.message || 'Failed to load question details.');
        setQuestion(null); // Clear question data on error
        return;
      }
      setQuestion(data); // Set the fetched question data
    } catch (err) {
      console.error('Error fetching single question:', err);
      setQuestionError('An unexpected error occurred while loading the question details.');
    } finally {
      setLoadingQuestion(false); // End loading regardless of success or failure
    }
  };

  // --- Function to fetch answers/comments for the current question ---
  const fetchAnswers = async () => {
    setLoadingAnswers(true);
    setAnswerError('');
    try {
      // Make API call to fetch answers for the specific question ID
      const response = await fetch(`http://localhost:3000/api/answers/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswerError(data.message || 'Failed to load answers.');
        setAnswers([]); // Clear answers on error
        return;
      }
      setAnswers(data); // Set the fetched answers
    } catch (err) {
      console.error('Error fetching answers:', err);
      setAnswerError('An unexpected error occurred while loading answers.');
    } finally {
      setLoadingAnswers(false); // End loading
    }
  };

  // --- useEffect hook to trigger data fetches when the component mounts or questionId changes ---
  useEffect(() => {
    if (questionId) {
      fetchQuestion(); // Fetch the main question
      fetchAnswers();  // Fetch its associated answers
    } else {
      setLoadingQuestion(false);
      setLoadingAnswers(false);
      setQuestionError('No question ID provided.'); // Handle case where ID is missing
    }
  }, [questionId]); // Dependency array: re-run effect if questionId changes


  // --- Handle posting a new answer/comment ---
  const handlePostAnswer = async () => {
    setPostAnswerLoading(true);
    setAnswerError(''); // Clear previous errors related to answers

    // If user is not logged in, redirect them to the login page
    if (!isLoggedIn || !token) {
      router.push('/login');
      setPostAnswerLoading(false);
      return;
    }
    // Basic validation for the new answer content
    if (!newAnswerContent.trim()) {
      setAnswerError('Answer content cannot be empty.');
      setPostAnswerLoading(false);
      return;
    }

    try {
      // Make API call to post the new answer
      const response = await fetch('http://localhost:3000/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify({
          questionId, // Associate the answer with the current question
          content: newAnswerContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswerError(data.message || 'Failed to post answer.');
        return;
      }

      // If successful:
      // 1. Add the newly posted answer to the local state (optimistic update)
      setAnswers((prevAnswers) => [...prevAnswers, data]);
      // 2. Clear the input box
      setNewAnswerContent('');
      // 3. Optimistically update the question's answersCount
      if (question) {
        setQuestion(prevQ => ({ ...prevQ, answersCount: (prevQ.answersCount || 0) + 1 }));
      }

    } catch (err) {
      console.error('Error posting answer:', err);
      setAnswerError('An unexpected error occurred while posting your answer.');
    } finally {
      setPostAnswerLoading(false);
    }
  };


  // --- Conditional Rendering for Loading, Error, and Not Found States ---
  if (loadingQuestion || loadingAnswers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        {loadingQuestion ? 'Loading question details...' : 'Loading answers...'}
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-400 p-4">
        <p className="text-xl mb-4">{questionError}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300">Go to Home Page</Link>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        Question not found.
      </div>
    );
  }

  // --- Main Render for the Single Question Page ---
  return (
    // Outer container for the page, styled for dark theme and offsets for fixed Navbar/Sidebar
<div className="min-h-screen bg-[#1d2329] text-gray-100 p-4 pt-16 ">
  <div className="max-w-4xl mx-auto bg-[#262d34] p-8 rounded-lg shadow-xl m-4 w-full">
        {/* Question Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100 break-words">
          {question.title}
        </h1>

        {/* Author Info (Image, Username, University, Date) */}
        <div className="flex items-center space-x-3 text-gray-400 text-sm mb-6 pb-4 border-b border-gray-700">
          {/* <Image
            src={question.author?.profilePicture || "https://placehold.co/40x40/555/FFF?text=User"}
            alt={question.author?.username || 'Author'}
            width={40}
            height={40}
            className="rounded-full border border-gray-600"
          /> */}
          <img src={question.author?.profilePicture || "https://placehold.co/40x40/555/FFF?text=User"} alt={question.author?.username || 'Author'} className="rounded-full border border-gray-600 w-10 h-10" />
          <div className="flex flex-col">
            <span className="font-medium text-blue-400">{question.author?.username}</span>
            <span className="text-gray-500">{question.author?.university}</span>
          </div>
          <span className="text-gray-500"> • Asked {new Date(question.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Question Content */}
        <div className="prose prose-invert max-w-none mb-8 text-gray-200 leading-relaxed">
          <p>{question.content}</p> {/* Content is rendered here */}
        </div>

        {/* Views and Answers Count */}
        <div className="flex items-center space-x-6 text-gray-400 text-sm mb-8 pb-4 border-b border-gray-700">
          <span className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{question.views || 0} Views</span>
          </span>
          <span className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>{question.answersCount || 0} Answers</span>
          </span>
        </div>

        {/* Answer/Comment Input Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Your Answer</h2>
        <div className="bg-[#2c353d] p-6 rounded-lg shadow-md mb-8">
            <textarea
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y min-h-[100px]"
                placeholder="Write your answer or comment here..."
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
                rows={4}
            ></textarea>
            {answerError && <p className="text-red-400 text-sm mb-2">{answerError}</p>}
            <button
                onClick={handlePostAnswer}
                disabled={postAnswerLoading}
                className="w-full sm:w-auto px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {postAnswerLoading ? 'Posting...' : 'Post Answer'}
            </button>
        </div>

        {/* Existing Answers/Comments Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Answers ({answers.length})
        </h2>
        <div className="space-y-4"> {/* Spacing between answer cards */}
          {loadingAnswers ? (
            <div className="text-gray-400 text-center">Loading answers...</div>
          ) : answers.length === 0 ? (
            <div className="text-gray-400 text-center">No answers yet. Be the first to answer!</div>
          ) : (
            answers.map(answer => (
              <AnswerCard key={answer._id} answer={answer} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
// src/app/questions/[id]/page.js
