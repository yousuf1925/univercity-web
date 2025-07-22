// Signup Page for new users to register using username, email, password, university, major, and year

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !email || !password || !university || !major || !year) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (isNaN(year) || parseInt(year) < 1 || parseInt(year) > 10) {
      setError('Year must be a number between 1 and 10.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          university,
          major,
          year: parseInt(year),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
   let classes = "text-white mt-1 block w-full px-4 py-2 border-none rounded-md sm:text-sm transition duration-150 ease-in-out bg-[#2c353d] shadow-lg";
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e252b] p-4 ">
      <div className="bg-[#262d34] p-8 rounded-lg shadow-xl w-full max-w-lg mt-15 text-black">
        <h2 className="text-3xl font-bold text-center text-orange-400 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="text-white mt-1 block w-full px-4 py-2 border-none rounded-md sm:text-sm transition duration-150 ease-in-out bg-[#2c353d] shadow-lg"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={classes}
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={classes}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-white mb-1">
              University
            </label>
            <input
              type="text"
              id="university"
              className={classes}
              placeholder="e.g., NUST"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-white mb-1">
              Major
            </label>
            <input
              type="text"
              id="major"
              className={classes}
              placeholder="e.g., Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-white mb-1">
              Year of Study
            </label>
            <input
              type="number"
              id="year"
              className={classes}
              placeholder="e.g., 2 (for sophomore)"
              value={year === null || year === undefined || isNaN(year) ? '' : year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center -mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
