'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AskQuestionForm from './components/AskQuestionForm';
import QuestionCard from './components/QuestionCard';
import Navbar from './components/Navbars';
import "./globals.css";
import NewsCard from "./components/NewsCard";

export default function Home() {
  const { loading: authLoading } = useAuth(); 

  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuestions = async (search = '') => {
    setQuestionsLoading(true);
    setQuestionsError('');

    try {
      const url = search
        ? `/api/questions?search=${encodeURIComponent(search)}`
        : '/api/questions';

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setQuestionsError(data.message || 'Failed to fetch questions.');
        return;
      }

      setQuestions(data.questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestionsError('An unexpected error occurred.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(); // Fetch all on initial load
  }, []);

  const handleSearch = (text) => {
    event.preventDefault(); // Prevent default form submission
    setSearchTerm(text);
    fetchQuestions(text);
  };

  if (authLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e252b] text-gray-300">
        {authLoading ? 'Loading authentication...' : 'Loading questions...'}
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center bg-[#1e252b] text-gray-100 pt-0 mt-16">
      <Navbar onSearch={handleSearch} />

      <div className="flex w-full max-w-7xl mx-auto gap-6 p-4 overflow-hidden">
        <NewsCard />

        <div className="flex-1 overflow-y-auto scrollbar-hidden pt-0">
          <div className="mb-8">
            <AskQuestionForm />
          </div>

          <section className="w-full">
            {questionsError && (
              <div className="text-red-400 text-center mb-4 p-4 bg-[#1e252b] rounded-lg shadow-md">
                <p>{questionsError}</p>
              </div>
            )}

            {questions.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-400 text-center">
                <p>No questions posted yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question) => (
                  <QuestionCard 
                    key={question._id} 
                    question={question} 
                    isAuthor={true} 
                    onDeleteSuccess={(deletedId) =>
                      setQuestions(prev => prev.filter(q => q._id !== deletedId))
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
