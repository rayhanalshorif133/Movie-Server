"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { 
  MdOutlineDashboard, 
  MdLocalMovies, 
  MdOutlinePhotoLibrary,
  MdOutlineCloudDone,
  MdOutlineLogout
} from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import { FaGamepad } from "react-icons/fa6";
import { RiMovie2AiFill } from "react-icons/ri";
import { HiOutlineSparkles, HiOutlineFilm } from "react-icons/hi2";

export default function Sidebar() {
  const pathname = usePathname();
  const [navigatingHref, setNavigatingHref] = useState(null);

  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: <MdOutlineDashboard className="text-lg" />, 
      type: 'link' 
    },
    { label: 'Entertainment', type: 'header' },
    { 
      label: 'Movies List', 
      href: '/admin/movies', 
      icon: <MdLocalMovies className="text-lg" />, 
      type: 'link' 
    },
    { 
      label: 'Add & Manage Movie', 
      href: '/admin/movies/manage', 
      icon: <RiMovie2AiFill className="text-lg" />, 
      type: 'link' 
    },
    { label: 'Gaming Zone', type: 'header' },
    { 
      label: 'Games & Assets', 
      href: '/admin/games', 
      icon: <FaGamepad className="text-lg" />, 
      type: 'link' 
    },
    { 
      label: 'Manage Games', 
      href: '/admin/games/manage', 
      icon: <FaGamepad className="text-lg" />, 
      type: 'link' 
    },
    { label: 'Gmail Management', type: 'header' },
    { 
      label: 'Gmail Accounts', 
      href: '/admin/gmails', 
      icon: <BiLogoGmail className="text-lg" />, 
      type: 'link' 
    },
    { 
      label: 'Storage Inventory', 
      href: '/admin/gmails/inventory', 
      icon: <BiLogoGmail className="text-lg" />, 
      type: 'link' 
    },
    { label: 'Media Library', type: 'header' },
    { 
      label: 'Drive Gallery', 
      href: '/admin/images', 
      icon: <MdOutlinePhotoLibrary className="text-lg" />, 
      type: 'link',
      badge: 'Drive'
    },
  ];

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 shadow-xs select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <HiOutlineFilm className="text-xl" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-gray-900 tracking-tight">MovieServer</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 border border-blue-200">PRO</span>
            </div>
            <span className="text-[11px] font-medium text-gray-400">Admin Console</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links with custom scroll */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin scrollbar-thumb-gray-200">
        {menuItems.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div 
                key={index} 
                className="pt-4 pb-1.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {item.label}
              </div>
            );
          }

          const isActive = pathname === item.href;
          const isNavigating = navigatingHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  setNavigatingHref(item.href);
                }
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isNavigating ? (
                  <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </div>

              {isNavigating ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 animate-pulse">
                  Loading...
                </span>
              ) : item.badge ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status & Logout */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2 mt-auto">
        {/* System Health Pill */}
        <div className="px-3 py-2 rounded-xl bg-white border border-gray-100 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-gray-600 text-[11px]">System Online</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-gray-400">Sheet + Drive</span>
        </div>

        {/* Logout Button */}
        <form action={logout}>
          <button className="cursor-pointer flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors border border-transparent hover:border-rose-100">
            <MdOutlineLogout className="text-sm" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
