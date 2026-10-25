import React from 'react'
import {  ChevronLeft, ChevronRight } from 'lucide-react';

export default function GmailListPagination({totalCount,currentPage,setCurrentPage, totalPages, loading }) {
    return (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <span className="text-xs text-gray-500">
                Total: <span className="font-bold">{totalCount}</span> Gmails
            </span>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0 || loading}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-semibold">
                    {currentPage + 1} / {totalPages || 1}
                </span>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className="p-1.5 border rounded hover:bg-white disabled:opacity-30"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
