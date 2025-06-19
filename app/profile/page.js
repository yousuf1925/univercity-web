// src/app/profile/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Your Auth context
import Image from 'next/image'; // For optimized images

export default function ProfilePage() {
  const { user: currentUser, token, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]); // State for user's questions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfileAndQuestions = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch authenticated user's profile data
        const profileResponse = await fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const profileDataJson = await profileResponse.json();

        if (!profileResponse.ok) {
          if (profileResponse.status === 401 && profileDataJson.message === 'Token expired') {
            alert('Your session has expired. Please log in again.');
            logout();
            router.push('/login');
          } else {
            setError(profileDataJson.message || 'Failed to fetch profile.');
          }
          setLoading(false);
          return;
        }

        setProfileData(profileDataJson.user); // The API returns { user: ... }

        // 2. Fetch user's questions
        // This API endpoint still needs to be created if it doesn't exist: src/app/api/users/[id]/questions/route.js
        const questionsResponse = await fetch(`http://localhost:3000/api/users/${profileDataJson.user._id}/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Can be protected or public depending on your needs
          },
        });

        const questionsData = await questionsResponse.json();

        if (!questionsResponse.ok) {
          setError(questionsData.message || 'Failed to fetch user questions.');
          // Optionally, don't stop loading entirely if only questions failed but profile succeeded
          setLoading(false);
          return;
        }

        setUserQuestions(questionsData); // Assuming questionsData is an array of questions

      } catch (err) {
        console.error('Error fetching profile or questions:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndQuestions();
  }, [token, router, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <p className="text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-4">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <p className="text-lg">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 mt-[3%]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center sticky top-8 h-fit">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg">
            {profileData.profilePicture ? (
              <Image
                src={profileData.profilePicture}
                alt={`${profileData.username}'s profile picture`}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              // Default avatar if no profile picture
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-5xl font-bold text-gray-400">
                {profileData.username ? profileData.username[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-orange-400 mb-2">{profileData.username}</h1>
          <p className="text-gray-400 mb-4 text-center">{profileData.major} @ {profileData.university}</p>

          {profileData.bio && (
            <p className="text-gray-300 text-center text-sm italic mb-6">
              &quot;{profileData.bio}&quot;
            </p>
          )}

          <div className="w-full text-center mb-6">
            <span className="text-orange-500 font-bold text-2xl mr-2">{profileData.reputationScore || 0}</span>
            <span className="text-gray-400 text-sm">Reputation</span>
          </div>

          <div className="w-full flex justify-around border-t border-gray-700 pt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-200">{profileData.questionsAsked || 0}</p>
              <p className="text-gray-400 text-sm">Questions Asked</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-200">{profileData.answersGiven || 0}</p>
              <p className="text-gray-400 text-sm">Answers Given</p>
            </div>
          </div>

          <div className="mt-8 w-full space-y-4">
  
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-3 px-6 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition duration-200 ease-in-out shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Right Column: User's Posts (Questions) */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-orange-400 mb-4 pb-2 border-b border-gray-700">Your Questions</h2>

          {userQuestions.length > 0 ? (
            userQuestions.map((question) => (
              <div key={question._id} className="bg-gray-800 rounded-lg shadow-xl p-5 border border-gray-700">
                <Link href={`/questions/${question._id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-100 hover:text-orange-400 transition-colors duration-200">
                    {question.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{question.content}</p>
                </Link>
                <div className="flex justify-between items-center text-gray-500 text-xs mt-4">
                  <span className="text-gray-400">
                    Asked on {new Date(question.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <div className="flex space-x-4">
                    <span className="flex items-center text-purple-400">
                      {/* Views Icon */}
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {question.views || 0} Views
                    </span>
                    <span className="flex items-center text-green-400">
                      {/* Answers Icon */}
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.746-1.348l-2.463.856a1 1 0 01-1.292-1.292l.856-2.463A8.841 8.841 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      {question.answersCount || 0} Answers
                    </span>
                  </div>
                </div>
                {question.majorTags && question.majorTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.majorTags.map((tag, index) => (
                      <span key={index} className="bg-orange-700 text-orange-200 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-xl p-5 text-center text-gray-400">
              You haven't asked any questions yet.
              <Link href="/ask-question" className="block mt-4 text-orange-400 hover:underline">
                Ask your first question!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}