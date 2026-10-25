import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <div className="relative">
        <h1 className="text-[150px] font-black text-gray-800 animate-pulse">404</h1>
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-blue-500 whitespace-nowrap">
            Page Not Found
        </p>
      </div>
      
      <p className="text-gray-400 mt-4 mb-8 max-w-md text-center">
        The level you are looking for doesn't exist or has been moved to another server.
      </p>

      <Link 
        href="/" 
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
      >
        Back to Home Base
      </Link>
    </div>
  );
}