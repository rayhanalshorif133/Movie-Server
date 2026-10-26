import Link from 'next/link';
import React from 'react';
import { HiOutlineHome, HiOutlineChevronRight } from 'react-icons/hi';
import { FiExternalLink } from 'react-icons/fi';
import { RiMovie2Line } from 'react-icons/ri';

export default function Header({ title, publicURL, pageTitle }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100/80">
      <div>
        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1.5">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <HiOutlineHome className="text-sm" />
            <span>Home</span>
          </Link>
          <HiOutlineChevronRight className="text-[10px] text-gray-300" />
          <span className="text-gray-600 font-semibold">{title}</span>
        </nav>

        {/* Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {publicURL && (
          <a
            href={publicURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>View Public {pageTitle || 'Site'}</span>
            <FiExternalLink className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-xs" />
          </a>
        )}
      </div>
    </header>
  );
}
