// src/app/signup/page.js
'use client'; // This directive marks the file as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import Link from 'next/link';                 // For linking to other pages
import { useAuth } from '@/context/AuthContext'; // Import the authentication context

export default function SignupPage() {
  // State variables for form inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  // State for loading status during API call
  const [loading, setLoading] = useState(false);
  // State for error messages from the API or client-side validation
  const [error, setError] = useState('');

  const router = useRouter(); // Initialize Next.js router
  const { login } = useAuth(); // Get the login function from AuthContext

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);   // Set loading to true
    setError('');       // Clear previous errors

    // Basic client-side validation
    if (!username || !email || !password || !university || !major || !year) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (password.length < 6) { // Example: Minimum password length
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (isNaN(year) || parseInt(year) < 1 || parseInt(year) > 10) { // Example: Year validation
        setError('Year must be a number between 1 and 10.');
        setLoading(false);
        return;
    }

    try {
      // Make the API call to your backend registration endpoint
      // Ensure the URL matches your Next.js API route path
      const response = await fetch('http://localhost:3001/api/auth', {
        method: 'POST', // Using POST for registration
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          university,
          major,
          year: parseInt(year), // Ensure year is sent as a number
        }),
      });

      // Parse the JSON response
      const data = await response.json();

      if (!response.ok) {
        // If response is not OK, set the error message
        setError(data.message || 'Registration failed. Please try again.');
        return; // Stop execution
      }

      // If registration is successful, use the login function from AuthContext
      // Our simplified backend logs in the user immediately after successful registration
      login(data.token, data.user);

      // Redirect to the home page or dashboard after successful registration
      router.push('/'); // Adjust this path as needed

    } catch (err) {
      // Catch network errors or other unexpected issues
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <input
              type="text"
              id="university"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., NUST"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
              Major
            </label>
            <input
              type="text"
              id="major"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., Computer Science"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year of Study
            </label>
            <input
              type="number"
              id="year"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., 2 (for sophomore)"
              value={year}
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
