"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { MdOutlineDashboard, MdLocalMovies, MdOutlinePhotoLibrary } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import { FaGamepad } from "react-icons/fa6";
import { RiMovie2AiFill } from "react-icons/ri";







export default function Sidebar() {
    const pathname = usePathname();
    const menuItems = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: <MdOutlineDashboard/>, type: 'link' },
        { label: 'Entertainment', type: 'header' },
        { label: 'Movies List', href: '/admin/movies', icon: <MdLocalMovies/>, type: 'link' },
        { label: 'Movies Manage', href: '/admin/movies/manage', icon: <RiMovie2AiFill/>, type: 'link' },
        { label: 'Gaming Zone', type: 'header' },
        { label: 'Games & Assets', href: '/admin/games', icon: <FaGamepad/>, type: 'link' },
        { label: 'Manage', href: '/admin/games/manage', icon: <FaGamepad/>, type: 'link' },
        { label: 'Gmail Managemanet', type: 'header' },
        { label: 'Gmail List', href: '/admin/gmails', icon: <BiLogoGmail/>, type: 'link' },
        { label: 'Gmail Inventory', href: '/admin/gmails/inventory', icon: <BiLogoGmail/>, type: 'link' },
        { label: 'Media Library', type: 'header' },
        { label: 'Image Repository', href: '/admin/images', icon: <MdOutlinePhotoLibrary/>, type: 'link' },
    ];

    return (
        <aside className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-yellow-400 w-fit px-2 h-8 uppercase rounded-md flex items-center justify-center text-xs">
                        Movie
                    </span>
                    <span className='font-oswald font-medium'>Admin Panel</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, index) => {
                    if (item.type === 'header') {
                        return (
                            <div key={index} className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">
                                {item.label}
                            </div>
                        );
                    }

                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex font-roboto font-normal items-center gap-3 p-3 rounded-md transition ${isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50 font-medium"
                                }`}
                        >
                            <span className={`${isActive ? 'text-xl rotate-45': 'text-sm'}`}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <form action={logout}>
                    <button className="cursor-pointer flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-50 rounded-md transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}

