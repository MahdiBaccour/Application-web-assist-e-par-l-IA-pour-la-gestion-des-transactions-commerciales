"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - Page non trouvée";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 px-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 max-w-5xl w-full">
        {/* Image on the Left */}
        <img
          src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1744465382/projet-pfe/other/image_g7rdxa.png"
          alt="404 Illustration"
          className="w-[450px] md:w-[550px] rounded-xl shadow-lg"
        />

        {/* Text on the Right */}
        <div className="text-center md:text-left">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <p className="text-2xl text-gray-600 mt-4">Oups ! Page non trouvée.</p>
          <p className="text-gray-500 mt-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <span className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">
              Retourner à Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}