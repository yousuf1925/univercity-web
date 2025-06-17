// src/components/QuestionCard.js
'use client'; // Client component for click handlers and navigation

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function QuestionCard({ question }) {
  const router = useRouter();

  // Basic check for valid question data
  if (!question || !question.author) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-red-400">
        Error: Invalid question data.
      </div>
    );
  }

  // Function to truncate content for display on the card
  const truncateContent = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Link
      href={`/questions/${question._id}`} // Link to the full question page
      passHref // Pass href to the underlying <a> tag
      className="block bg-[#262d34]  p-6 rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer border border-gray-700 hover:border-blue-500"
    >
      <div className="flex flex-col space-y-4">
        {/* Question Title */}
        <h3 className="text-2xl font-bold text-gray-100">{question.title}</h3>

        {/* Question Content Snippet */}
        <p className="text-gray-300 text-base leading-relaxed">
          {truncateContent(question.content)}
        </p>

        {/* Author, Views, Answers Section */}
        <div className="flex items-center justify-between text-gray-400 text-sm mt-4 pt-4 border-t border-gray-700">
          {/* Author Info */}
          <div className="flex items-center space-x-2">
            <Image
              src={question.author.profilePicture || "https://placehold.co/40x40/555/FFF?text=User"} // Placeholder if no picture
              alt={question.author.username || 'Author'}
              width={32}
              height={32}
              className="rounded-full border border-gray-600"
            />
            <span className="font-medium text-blue-400 hover:underline">
              {question.author.username}
            </span>
            <span className="text-gray-500"> • {question.university}</span>
          </div>

          {/* Views and Answers */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{question.views || 0} Views</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{question.answersCount || 0} Answers</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
