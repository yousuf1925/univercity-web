// src/app/profile/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 
import Image from 'next/image'; // For optimized images
import QuestionCard from '../components/QuestionCard';

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
        // Assuming your /api/profile endpoint returns the authenticated user's data
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

        setProfileData(profileDataJson.user);
        const userId = profileDataJson.user._id; 
   const questionsResponse = await fetch(`http://localhost:3000/api/users/${userId}/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`,
          },
        });

        const questionsData = await questionsResponse.json();

        if (!questionsResponse.ok) {
          setError(questionsData.message || 'Failed to fetch user questions.');
          setLoading(false);
          return;
        }

        setUserQuestions(questionsData); 

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
    <div className="min-h-screen bg-[#1e252b] text-gray-100 p-4 sm:p-6 md:p-8 mt-[5%]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 bg-[#262d34]  rounded-lg shadow-xl p-6 flex flex-col items-center sticky top-8 h-fit">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg">
            {profileData.profilePicture ? (
            //   <Image
            //     src={profileData.profilePicture}
            //     alt={`${profileData.username}'s profile picture`}
            //     layout="fill"
            //     objectFit="cover"
            //   />
            <img src={profileData.profilePicture} alt={`${profileData.username}'s profile picture`} className="w-full h-full object-cover" />
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
            {/* Added Edit Profile Link */}
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
              <QuestionCard 
  key={question._id} 
  question={question} 
  isAuthor={true} 
  onDeleteSuccess={(deletedId) => {
    setUserQuestions(prev => prev.filter(q => q._id !== deletedId));
  }}
/>
            )
          )) : (
            <div className="bg-gray-800 rounded-lg shadow-xl p-5 text-center text-gray-400">
              You haven't asked any questions yet.
              <Link href="/" className="block mt-4 text-orange-400 hover:underline">
                Ask your first question!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}