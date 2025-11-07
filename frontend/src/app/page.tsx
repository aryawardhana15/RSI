import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          RSI E-Learning Platform
        </h1>
        <p className="text-gray-600 mb-8">
          Platform pembelajaran online dengan gamification
        </p>
        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Daftar
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

