// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google"; // New Geist font imports
import "./globals.css"; // Your global CSS
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import Navbar from './components/Navbars'; // Import Navbar

// Initialize Geist fonts with their variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'University QA Platform', // Retaining your desired title
  description: 'A Q&A platform for university students.', // Retaining your desired description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // Apply Geist font variables and antialiased class
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap your entire application content with AuthProvider */}
        <AuthProvider>
          {/* Your global Navbar component */}
          
          {children} {/* This represents your page components */}
        </AuthProvider>
      </body>
    </html>
  );
}
