"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Clock, Sparkles } from "lucide-react";
import { IoReload } from "react-icons/io5";

export default function AutoSyncProgressModal({
  isOpen,
  status = "syncing", // "syncing" | "success" | "error"
  errorMessage = "",
  estimatedSeconds = 12,
  onClose,
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(0, Math.ceil(estimatedSeconds - elapsed));

  let progress = 0;
  if (status === "success") {
    progress = 100;
  } else if (status === "error") {
    progress = Math.min(95, Math.round((elapsed / estimatedSeconds) * 95));
  } else {
    // Normal syncing progress: smoothly moves from 0 to 95%
    progress = Math.min(95, Math.round((elapsed / estimatedSeconds) * 95));
  }

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}s`;
  };

  // Dynamic phase description
  let phaseText = "1/3 • Scanning Google Drive accounts & movies...";
  if (status === "success") {
    phaseText = "✨ Synchronization complete! Refreshing view...";
  } else if (status === "error") {
    phaseText = "❌ Synchronization encountered an error.";
  } else if (remaining === 0) {
    phaseText = "Finalizing Google Sheets sync... almost done!";
  } else if (progress > 65) {
    phaseText = "3/3 • Writing updates to Google Sheets & organizing inventory...";
  } else if (progress > 30) {
    phaseText = "2/3 • Calculating total MB to GB storage utilization...";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all p-6 sm:p-7 text-center">
        {/* Top vibrant gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Central Animated Badge */}
        <div className="flex justify-center mb-4 mt-1">
          <div className="relative">
            {status === "syncing" && (
              <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-40 animate-pulse" />
            )}
            <div
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                status === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : status === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
              ) : status === "error" ? (
                <AlertCircle className="w-8 h-8 animate-in zoom-in duration-300" />
              ) : (
                <IoReload className="w-8 h-8 animate-spin text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Modal Titles */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight">
          {status === "success"
            ? "Sync Complete!"
            : status === "error"
            ? "Sync Failed"
            : "Auto-Syncing Gmail Storage"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
          {status === "success"
            ? "Storage space and movie allocations have been successfully recorded."
            : status === "error"
            ? errorMessage || "An error occurred while synchronizing records."
            : "Recalculating Google Drive storage and syncing with Google Sheets"}
        </p>

        {/* Countdown Box (Only shown when syncing or completed) */}
        {status !== "error" && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-purple-50/40 border border-blue-100/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Estimated Time Remaining</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                {progress}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="text-2xl font-black font-mono tracking-tight text-blue-700">
                {status === "success" ? (
                  <span className="text-emerald-600 text-xl flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-5 h-5 text-emerald-500" /> Finished!
                  </span>
                ) : remaining > 0 ? (
                  formatCountdown(remaining)
                ) : (
                  <span className="text-indigo-600 text-base animate-pulse">
                    Wrapping up...
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                Est: ~{estimatedSeconds}s total
              </span>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden p-0.5 mt-3 border border-blue-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  status === "success"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Status Ticker */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <p className="text-xs font-medium text-gray-600 flex items-center justify-center gap-2">
            {status === "syncing" && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
            )}
            <span className="truncate">{phaseText}</span>
          </p>
        </div>

        {/* Error Close Action Button */}
        {status === "error" && (
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
