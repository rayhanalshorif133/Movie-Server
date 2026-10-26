import React from 'react';

export default function StatCard({ 
  label, 
  smallText, 
  text, 
  accentClass = "border-l-blue-500", 
  textClass = "text-gray-900",
  iconBg = "bg-blue-50 border-blue-100",
  icon = null
}) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 border-l-4 ${accentClass} group`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        {icon ? (
          <div className={`p-2 rounded-xl border ${iconBg} shadow-2xs group-hover:scale-110 transition-transform flex items-center justify-center`}>
            {icon}
          </div>
        ) : smallText ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            {smallText}
          </span>
        ) : null}
      </div>

      <div className={`text-3xl font-black mt-3 tracking-tight ${textClass}`}>
        {text ?? 0}
      </div>

      {smallText && icon && (
        <p className="text-[11px] font-medium text-gray-400 mt-2">
          {smallText}
        </p>
      )}
    </div>
  );
}
