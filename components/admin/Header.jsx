import Link from 'next/link'
import React from 'react'

export default function Header({ title, publicURL, pageTitle }) {
    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <nav className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">
                    <Link href={'/admin/dashboard'}>Home</Link> / {title}
                </nav>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <a
                    href={publicURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 border-l pl-4 py-1 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 group-hover:bg-yellow-500 flex items-center justify-center font-bold text-xs shadow-sm transition-all group-hover:scale-110">
                           {pageTitle ? pageTitle.charAt(0) : 'M'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800 leading-tight">{pageTitle}</span>
                            <span className="text-[10px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to View →
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        </header>
    )
}

