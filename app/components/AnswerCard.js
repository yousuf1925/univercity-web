// Render answer card
'use client';

import React from 'react';
import Image from 'next/image';

export default function AnswerCard({ answer }) {
  if (!answer || !answer.author) {
    return (
      <div className="bg-[#2c353d] p-4 rounded-lg text-red-400">
        Error: Invalid answer data.
      </div>
    );
  }

  const postedDate = new Date(answer.createdAt).toLocaleString();

  return (
    <div className="bg-[#2c353d] p-4 rounded-lg shadow-md border border-gray-600">
      <p className="text-gray-200 mb-3 text-base leading-relaxed">{answer.content}</p>

      <div className="flex items-center justify-between text-gray-400 text-sm mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <img
            src={answer.author.profilePicture || "https://placehold.co/30x30/444/FFF?text=User"}
            alt={answer.author.username || 'Author'}
            className="rounded-full border border-gray-500 w-7 h-7"
          />
          <span className="font-medium text-blue-300">
            {answer.author.username}
          </span>
          {answer.isAccepted && (
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">Accepted</span>
          )}
        </div>
        <span className="text-gray-500">Posted {postedDate}</span>
      </div>
    </div>
  );
}
