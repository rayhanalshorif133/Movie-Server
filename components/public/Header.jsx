import React from 'react'
import Link from 'next/link'


export default function Header() {
    return (
        <header className='w-full'>
            <nav
                className="bg-linear-to-r from-indigo-900 via-purple-800 to-teal-700 shadow-lg border-b border-white/10 relative z-50">
                <div className="px-4 md:px-8 py-4 flex items-center justify-between max-w-400 mx-auto">
                    <div className="flex items-center">
                        <Link href="index.html"
                            className="font-pacifico text-2xl md:text-3xl text-white font-cursive tracking-wide drop-shadow-md">
                            Entertainment Diary
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/"
                            className="text-xs font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300">Movies</Link>
                        <Link href="/games"
                            className="text-xs font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300 flex items-center gap-1">
                            <i className="fa-solid fa-gamepad"></i> Games
                        </Link>

                        <Link href="/login"
                            className="text-xs font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300">Admin</Link>
                    </div>
                    <div className="md:hidden flex items-center">
                        <button id="mobile-menu-btn" className="text-gray-200 hover:text-white focus:outline-none">
                            <i className="fa-solid fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div id="mobile-menu" className="hidden md:hidden bg-purple-900 border-t border-white/10 shadow-xl">
                    <div className="flex flex-col px-4 py-4 space-y-4">
                        <Link href="/"
                            className="text-sm font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300">Movies</Link>
                        <Link href="/games"
                            className="text-sm font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300"><i
                                className="fa-solid fa-gamepad mr-2"></i>Games</Link>

                        <Link href="/login"
                            className="text-sm font-bold text-gray-100 uppercase hover:text-yellow-300 transition duration-300">Admin</Link>
                    </div>
                </div>
            </nav>
        </header>
    )
}
