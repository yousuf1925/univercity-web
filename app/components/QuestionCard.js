// Render question card
'use client';

import React, { useState } from 'react'; // Import useState for local state (loading, error)
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Your Auth context


export default function QuestionCard({ question, onDeleteSuccess }) { // Add onDeleteSuccess prop
  const router = useRouter();
  const { user: currentUser, token } = useAuth(); 
  const [deleting, setDeleting] = useState(false); // State for delete loading
  const [deleteError, setDeleteError] = useState(''); // State for delete error
   const isAuthor = currentUser && currentUser.id === question.author._id; // Check if the current user is the author of the question
  if (!question || !question.author) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-red-400">
        Error: Invalid question data.
      </div>
    );
  }

  const truncateContent = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigating to the question page when clicking delete
    e.stopPropagation(); // Stop event propagation to parent Link

    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return; // User cancelled deletion
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/questions/${question._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the user's authentication token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setDeleteError(errorData.message || 'Failed to delete question.');
        return;
      }
      
      if (onDeleteSuccess) {
        onDeleteSuccess(question._id);
       
      } else {
        // Fallback: if no callback provided, refresh the page (less ideal UX)
        router.refresh(); // Or router.push(router.pathname) to force re-render
      }

    } catch (err) {
      console.error('Error deleting question:', err);
      setDeleteError('An unexpected error occurred during deletion.');
    } finally {
      setDeleting(false);
    }
  };


  return (
    // The main card is still a Link, but the delete button will prevent default navigation
    <Link
      href={`/questions/${question._id}`}
      passHref
      className="block bg-[#262d34] p-6 rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer border border-gray-700 hover:border-blue-500"
    >
      <div className="flex flex-col space-y-4">
        <h3 className="text-2xl font-bold text-gray-100">{question.title}</h3>

        <p className="text-gray-300 text-base leading-relaxed">
          {truncateContent(question.content)}
        </p>

        <div className="flex items-center justify-between text-gray-400 text-sm mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <Image
              src={question.author.profilePicture || "https://placehold.co/40x40/555/FFF?text=User"}
              alt={question.author.username || 'Author'}
              className="rounded-full border border-gray-600 w-8 h-8"
              width={40}
              height={40}
              unoptimized // Use unoptimized for external images or large images
              ></Image>
            <span className="font-medium text-blue-400 hover:underline">
              {question.author.username}
            </span>
            <span className="text-gray-500"> • {question.university}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{question.views || 0} Views </span>
            </span>
            <span className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>{question.answersCount || 0} Answers</span>
            </span>

            {/* Delete Button - Conditionally Rendered */}
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-red-400 ${deleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900 hover:text-red-300'} transition-colors duration-200`}
                title="Delete this question"
              >
                {deleting ? (
                  <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>
        {deleteError && (
          <p className="text-red-500 text-sm mt-2 text-center">{deleteError}</p>
        )}
      </div>
    </Link>
  );
}