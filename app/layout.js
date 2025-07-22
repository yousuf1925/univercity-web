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
  title: 'UNIVERCITY', 
  description: 'A Q&A platform for university students.', // Retaining your desired description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full `}
      >
        <AuthProvider>
          <Navbar/>
          {children} 
        </AuthProvider>
      </body>
    </html>
  );
}
