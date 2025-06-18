// src/components/Navbar.js
'use client'; // This directive marks the file as a Client Component

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { FaUserGroup } from "react-icons/fa6";
import { IoMdHome } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { useAuth } from '@/context/AuthContext';
import { FaPlusSquare } from "react-icons/fa"; // Existing icon import for Ask Question
import { FaUserCircle } from "react-icons/fa"; // NEW: Import for Profile Icon

export default function Navbar() {
  // Destructure authentication state and functions from AuthContext
  const { isLoggedIn, user, logout, loading } = useAuth();

  // If the authentication context is still loading, return null to prevent UI flicker
  if (loading) {
    return null;
  }

  return (
    <nav className="bg-[#262d34] text-white p-2 shadow-md fixed top-0 left-0 z-10 w-full h-16">
      <div className='flex items-center justify-between p-0 container mx-auto'>
        {/* Logo and App Name */}
        <Link href="/" className='flex items-center gap-2'>
          <Image
            src="/profile.jpg"
            alt="User profile picture"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h2 className='text-orange-500 text-2xl font-bold font-serif'>
            UniverCity
          </h2>
        </Link>

        {/* Central Navigation Links and Search Bar */}
        <div className="flex items-center gap-4">
          <Link href={"page"} className='hover:bg-orange-500 p-0.5 rounded-sm transition-all duration-300 ease-in-out'>
            <IoMdHome className='h-6 w-6 text-white' />
          </Link>
          <Link href={"/community"} className='hover:bg-orange-500 p-0.5 rounded-sm transition-all duration-300 ease-in-out'>
            <FaUserGroup className='h-6 w-6 text-white' />
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

        {/* Authentication/User Actions */}
        <div className='flex items-center space-x-4'>
          {/* Profile Icon (NEW: Only visible if logged in) */}
          {isLoggedIn && (
            <Link href="/profile" className='hover:bg-orange-500 p-0.5 rounded-sm transition-all duration-300 ease-in-out'>
              <FaUserCircle className='h-7 w-7 text-white' /> {/* Profile icon */}
            </Link>
          )}

          <button className='bg-[#2c353d] h-8 w-8 rounded-sm p-1 flex items-center justify-center'>
            <IoIosNotifications className='h-7 w-7 text-white' />
          </button>

          {isLoggedIn ? (
            // If logged in, show user info and logout button
            <div className="flex items-center space-x-2">
              <span className="text-white text-lg font-medium">
                Hello, {user?.username}
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
