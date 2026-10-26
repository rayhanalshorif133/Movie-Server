import Link from 'next/link';
import React from 'react';
import { HiOutlineChevronRight } from 'react-icons/hi';
import { FiExternalLink } from 'react-icons/fi';
import { FcHome, FcGlobe } from 'react-icons/fc';

export default function Header({ title, publicURL, pageTitle }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100/80">
      <div>
        {/* Breadcrumb Path with Color Home Icon */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1.5">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
          >
            <FcHome className="text-base group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
          <HiOutlineChevronRight className="text-[10px] text-gray-300" />
          <span className="text-gray-700 font-bold">{title}</span>
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
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95 group"
          >
            <FcGlobe className="text-base group-hover:rotate-12 transition-transform" />
            <span>View Public {pageTitle || 'Site'}</span>
            <FiExternalLink className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-xs" />
          </a>
        )}
      </div>
    </header>
  );
}
