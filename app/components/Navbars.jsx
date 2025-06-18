// src/components/Navbar.js
'use client'; // This directive marks the file as a Client Component

import React from 'react';
import Link from 'next/link';
import { useState } from 'react'; // Added by user
import Image from 'next/image'; // Added by user
import { FaUserGroup } from "react-icons/fa6"; // Added by user
import { IoMdHome } from "react-icons/io"; // Added by user
import { IoSearch } from "react-icons/io5"; // Added by user
import { IoIosNotifications } from "react-icons/io"; // Added by user
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook

export default function Navbar() {
  // Destructure authentication state and functions from AuthContext
  const { isLoggedIn, user, logout, loading } = useAuth();

  // If the authentication context is still loading, return null to prevent UI flicker
  // You could also return a loading spinner or skeleton here.
  if (loading) {
    return null;
  }

  return (
    <nav className="bg-[#262d34] text-white p-2 shadow-md fixed top-0 left-0 z-10 w-full h-16"> {/* Applied user's background color and text color */}
      <div className='flex items-center justify-between p-0 container mx-auto'> {/* Added container and mx-auto for centering */}
        {/* Logo and App Name */}
        <div className='flex items-center gap-2'>
          <Image
            src="/profile.jpg" // Using the image path provided by the user
            alt="User profile picture"
            width={40}    // The desired width in pixels
            height={40}   // The desired height in pixels
            className="rounded-full" // Optional: for styling
          />
          <h2 className='text-orange-500 text-2xl font-bold font-serif'>
            UniverCity
          </h2>
        </div>

        {/* Central Navigation Links and Search Bar */}
        <div className="flex items-center gap-4">
          <Link href={"/"} className='hover:bg-orange-500 p-0.5 rounded-sm transition-all duration-300 ease-in-out'>
            <IoMdHome className='h-6 w-6 text-white' /> {/* Ensures icon is white */}
          </Link>
          <Link href={"/community"} className='hover:bg-orange-500 p-0.5 rounded-sm transition-all duration-300 ease-in-out'>
            <FaUserGroup className='h-6 w-6 text-white' /> {/* Ensures icon is white */}
          </Link>
          {/* Search Bar */}
          <div className="flex items-center bg-[#2c353d] rounded-lg p-1 w-96 shadow-lg">
            <input
              type="text"
              placeholder="Type here to search..."
              className="flex-grow bg-transparent border-none outline-none text-gray-100 placeholder-gray-400 text-base py-1 px-0"
            />
            <button className="bg-transparent border-none cursor-pointer p-0 ml-2">
              <IoSearch className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Authentication/User Actions (Dynamic based on login status) */}
        <div className='flex items-center space-x-4'> {/* Added space-x-4 for spacing between items */}
          <button className='bg-[#2c353d] h-8 w-8 rounded-sm p-1 flex items-center justify-center'> {/* Changed align-center to justify-center */}
            <IoIosNotifications className='h-7 w-7 text-white' /> {/* Ensures icon is white */}
          </button>

          {isLoggedIn ? (
            // If logged in, show user info and logout button
            <div className="flex items-center space-x-2"> {/* Adjusted spacing for user info */}
              <span className="text-white text-lg font-medium">
                Hello, 
                <Link href="/profile" className="text-orange-500 hover:text-orange-600 transition duration-150 ease-in-out">
                {user?.username}
                </Link>
              </span>
              <button
                onClick={logout}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          ) : (
            // If not logged in, show Login/Sign Up button
            <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
