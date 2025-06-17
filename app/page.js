// src/app/page.js
'use client'; // This component needs to be a client component to use hooks

import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect
import Link from 'next/link'; // Still useful for error messages/navigation links
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook for authentication loading state
import AskQuestionForm from './components/AskQuestionForm'; // Import the compact Ask Question form
import QuestionCard from './components/QuestionCard'; // Import the QuestionCard component
import Navbar from './components/Navbars';
import "./globals.css";

export default function Home() {
  // Get authentication loading state from AuthContext (to show global loading message)
  const { loading: authLoading } = useAuth();

  // State for storing fetched questions
  const [questions, setQuestions] = useState([]);
  // State for tracking loading status of questions fetch
  const [questionsLoading, setQuestionsLoading] = useState(true);
  // State for storing any errors during questions fetch
  const [questionsError, setQuestionsError] = useState('');

  // useEffect hook to fetch questions when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestionsLoading(true); // Set loading to true before fetching
      setQuestionsError('');     // Clear any previous errors

      try {
        // Make the API call to your backend endpoint for listing questions
        const response = await fetch('http://localhost:3000/api/questions', {
          method: 'GET', // Use GET method
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json(); // Parse the JSON response

        if (!response.ok) {
          // If the response is not OK (e.g., 400, 500 status), set an error message
          setQuestionsError(data.message || 'Failed to fetch questions from the server.');
          return;
        }

        // If successful, update the questions state with the fetched data
        // Assuming the API returns an object with a 'questions' array
        setQuestions(data.questions);
      } catch (err) {
        // Catch any network errors or other unexpected issues
        console.error('Error fetching questions:', err);
        setQuestionsError('An unexpected error occurred while fetching questions. Please try again later.');
      } finally {
        setQuestionsLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchQuestions(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array means this effect runs only once on mount

  // Display a loading indicator if authentication data or questions are still loading
  if (authLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        {/* Shows specific loading message based on what's loading */}
        {authLoading ? 'Loading authentication...' : 'Loading questions...'}
      </div>
    );
  }

  return (
    // Main container for the homepage content, styled with dark theme
    // It will contain the AskQuestionForm and the list of QuestionCards
    <main className="h-screen flex flex-col items-center bg-[#1e252b] text-gray-100 p-4">
    
      {/* Two-column layout container */}
      <div className="flex w-full max-w-7xl mx-auto gap-6 p-4 overflow-hidden "> {/* Added gap for spacing between columns */}
        {/* Left Column (30% width) - for future content */}
        <aside className="hidden md:block w-3/10 p-4 bg-[#262d34] rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Left Sidebar (Coming Soon)</h3>
          <p className="text-gray-400 text-sm">
            This area can be used for filters, trending topics, or other navigation.
          </p>
        </aside>

        {/* Right Column (70% width) - contains Ask Question Form and Question List */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4"> {/* w-full for mobile, w-7/10 for medium+ screens */}
          {/* Render the compact Ask Question form */}
          <div className="mb-8"> {/* Added margin-bottom for spacing */}
            <AskQuestionForm />
          </div>

          {/* Section for displaying questions */}
          <section className="w-full">
         
            {/* Display error message if questions failed to load */}
            {questionsError && (
              <div className="text-red-400 text-center mb-4 p-4 bg-gray-800 rounded-lg shadow-md">
                <p>{questionsError}</p>
              </div>
            )}

            {/* Conditionally render questions list or loading/empty state */}
            {questionsLoading ? (
              // Show a local loading spinner/message for questions while fetching
              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-400 text-center">
                Loading recent questions...
              </div>
            ) : (
              // If not loading, check if there are questions or display empty message
              questions.length === 0 ? (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-400 text-center">
                  <p>No questions posted yet.</p>
                </div>
              ) : (
                // Render the list of QuestionCards
                <div className="space-y-6"> {/* Adds vertical spacing between cards */}
                  {questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
                </div>
              )
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
