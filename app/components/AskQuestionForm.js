// src/components/AskQuestionCompactForm.js
'use client'; // This component will be a client-side component

import React, { useState, useEffect } from 'react'; // Added useEffect import
import { useRouter } from 'next/navigation'; // Added useRouter import
import { useAuth } from '../../context/AuthContext';

 


export default function AskQuestionForm() {
  const router = useRouter(); 
  const { user, token, isLoggedIn, loading: authLoading } = useAuth(); // Get user, token, isLoggedIn, authLoading

  // State for form inputs - only title and content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    
    if (!title || !content) {
      setError('Both title and content are required.');
      setLoading(false);
      return;
    }
    if (!token || !isLoggedIn) {
      setError('You must be logged in to ask a question. Redirecting to login...');
      setLoading(false);
      
      router.push('/login');
      return; 
    }
 if (!user || !user.university) {
        setError('User data not fully loaded. Please try again or re-login.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/questions', { // Ensure port is 3001
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify({
          title,
          content,
           }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to post question. Please try again.');
        return;
      }

      setSuccessMessage('Question posted!'); // Simpler success message
      setTitle(''); // Clear the form
      setContent('');

    } catch (err) {
      console.error('Error posting question:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // The form is always rendered now, no return null.
  return (
    <div className="bg-[#262d34] p-4 rounded-lg shadow-xl w-full max-w-2xl mx-auto flex flex-col items-center ">
      {/* Title Input */}
      <input
        type="text"
        placeholder="Ask your question here..."
        className="w-full px-3 py-2 mb-2 border border-gray-600 rounded-md bg-[#2c353d]  text-white placeholder-gray-400 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={200}
      />
      {/* Content Textarea */}
      <textarea
        placeholder="Add details..."
        rows="2" // Compact textarea
        className="w-full px-3 py-2 mb-3 border border-gray-600 rounded-md bg-[#2c353d]  text-white placeholder-gray-400 text-sm resize-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>

      {/* Error/Success Messages */}
      {error && (
        <p className="text-red-400 text-xs text-center mb-2">{error}</p>
      )}
      {successMessage && (
        <p className="text-green-400 text-xs text-center mb-2">{successMessage}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        onClick={handleSubmit} // Call handleSubmit on click
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Posting...' : 'Post Question'}
      </button>
    </div>
  );
}
