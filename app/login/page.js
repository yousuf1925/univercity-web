// src/app/login/page.js
'use client'; // This directive marks the file as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation
import Link from 'next/link';                 // For linking to other pages
import { useAuth } from '@/context/AuthContext'; // Import the authentication context

export default function LoginPage() {
  // State variables for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State for loading status during API call
  const [loading, setLoading] = useState(false);
  // State for error messages from the API or client-side validation
  const [error, setError] = useState('');

  const router = useRouter(); // Initialize Next.js router
  const { login } = useAuth(); // Get the login function from AuthContext

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setLoading(true);   // Set loading to true while request is in progress
    setError('');       // Clear any previous errors

    try {
      // Make the API call to your backend login endpoint
      // Ensure the URL matches your Next.js API route path
      const response = await fetch('http://localhost:3000/api/auth', {
        method: 'PATCH', // Using PATCH for login as defined in backend route handler
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password in JSON body
      });

      // Parse the JSON response
      const data = await response.json();

      if (!response.ok) {
        // If response is not OK (e.g., 400, 401, 500), set the error message
        setError(data.message || 'Login failed. Please try again.');
        return; // Stop execution
      }

      // If login is successful, use the login function from AuthContext
      // This will store the token and user data, and update global state
      login(data.token, data.user);

      // Redirect to the home page or dashboard after successful login
      router.push('/'); // Adjust this path as needed for your application's main page

    } catch (err) {
      // Catch network errors or other unexpected issues
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="text-black mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
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
              className="text-black mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
