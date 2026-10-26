import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Loading Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200/70">
        <div className="space-y-2">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            <span className="text-gray-300 text-xs">/</span>
            <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          {/* Title Skeleton */}
          <div className="h-8 w-60 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Floating Animated Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-xs text-xs font-semibold text-blue-700">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Loading page data...</span>
        </div>
      </div>

      {/* KPI Stat Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2.5 w-36 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content / Table Card Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Table Toolbar Skeleton */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-9 w-64 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-9 w-28 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Rows Skeleton */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-14 bg-gray-200 rounded-lg shrink-0 animate-pulse"></div>
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-blue-50 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

