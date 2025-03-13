// pages/404.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="text-center">
        <img
          src="https://ik.imagekit.io/your-username/404-vector.svg" // Replace with your vector image URL
          alt="404 Illustration"
          className="w-64 mx-auto mb-8"
        />
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-2xl text-gray-600 mt-4">Oops! Page not found.</p>
        <p className="text-gray-500 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <span className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">
            Go Back Home
          </span>
        </Link>
      </div>
    </div>
  );
}
