// src/components/AnswerCard.js
'use client';

import React from 'react';
import Image from 'next/image';

export default function AnswerCard({ answer }) {
  // Basic validation for answer data
  if (!answer || !answer.author) {
    return (
      <div className="bg-[#2c353d] p-4 rounded-lg text-red-400">
        Error: Invalid answer data.
      </div>
    );
  }

  // Format date and time
  const postedDate = new Date(answer.createdAt).toLocaleString();

  return (
    <div className="bg-[#2c353d] p-4 rounded-lg shadow-md border border-gray-600">
      {/* Answer Content */}
      <p className="text-gray-200 mb-3 text-base leading-relaxed">{answer.content}</p>

      {/* Author and Date/Time */}
      <div className="flex items-center justify-between text-gray-400 text-sm mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <Image
            src={answer.author.profilePicture || "https://img.freepik.com/premium-vector/avatar-young-man-minimalist-cartoon-icon-drawing-vector-illustration_608387-13.jpg?w=360"} // Placeholder
            alt={answer.author.username || 'Author'}
            width={28}
            height={28}
            className="rounded-full border border-gray-500"
          />
          <span className="font-medium text-blue-300">
            {answer.author.username}
          </span>
          {answer.isAccepted && ( // Optional: Indicator if answer is accepted
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">Accepted</span>
          )}
        </div>
        <span className="text-gray-500">Posted {postedDate}</span>
      </div>
    </div>
  );
}
