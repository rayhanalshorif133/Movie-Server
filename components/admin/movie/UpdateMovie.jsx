"use client";

import ImageUploader from '@/components/common/ImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import { getGoogleDriveImageUrl } from '@/utils/google/manage';
import React, { useEffect, useRef, useState } from 'react';
import { MdClear } from "react-icons/md";
import { FiClipboard, FiCheck, FiLoader, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import Swal from 'sweetalert2';

export default function UpdateMovie({ movie }) {
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    poster: '',
    type: '',
    url: '',
    size: '',
    movie_source: '',
    dubbed_lang: '',
    part_name: '',
    subtitle_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingDrive, setFetchingDrive] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); // 'success' | 'error' | null
  const [fetchMessage, setFetchMessage] = useState('');
  const [gmailList, setGmailList] = useState([]);
  const [driveId, setDriveId] = useState('');
  const [isSeries, setIsSeries] = useState(false);
  const inputRef = useRef(null);

  // Load existing movie data
  useEffect(() => {
    if (movie) {
      setFormData({
        _id: movie.id || '',
        title: movie.title || '',
        poster: movie.poster || '',
        type: movie.type || '',
        url: beautifyDriveURL(movie.url || ''),
        size: movie.size || '',
        movie_source: movie.movie_source || '',
        dubbed_lang: movie.dubbed_lang || '',
        part_name: movie.part_name || '',
        subtitle_url: movie.subtitle_url || '',
      });
      if (movie.part_name && movie.part_name !== 'single') {
        setIsSeries(true);
      }
    }
  }, [movie]);

  // Load registered storage Gmail accounts
  useEffect(() => {
    axios.get('/api/gmails?page=0&limit=100')
      .then(res => {
        if (res.data?.data) {
          const emails = res.data.data.map(g => g.name || g.email).filter(Boolean);
          setGmailList([...new Set(emails)]);
        }
      })
      .catch(err => {
        console.warn('Could not pre-load gmails for datalist:', err.message);
      });
  }, []);

  useEffect(() => {
    if (driveId) {
      setFormData(prev => ({ ...prev, poster: driveId }));
    }
  }, [driveId]);

  const beautifyDriveURL = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        return fileIdMatch[0];
      }
    }
    return url;
  };

  /**
   * Process a Google Drive URL or File ID
   */
  const processDriveUrl = async (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return;
    if (fetchingDrive) return;

    setFetchingDrive(true);
    setFetchStatus(null);
    setFetchMessage('Connecting to Google Drive to fetch file metadata...');

    try {
      let data = null;

      // 1. Try Server Action
      try {
        data = await getMovieFileInfo(rawUrl.trim());
      } catch (actionErr) {
        console.warn('Server action error, trying API fallback:', actionErr);
      }

      // 2. Fallback to /api/movie-info REST endpoint
      if (!data || !data.success) {
        const response = await axios.get(`/api/movie-info?url=${encodeURIComponent(rawUrl.trim())}`);
        data = response.data;
      }

      if (data && data.success) {
        const { fileId, name, title, gmail, movie_source, size } = data;
        const finalTitle = name || title || '';
        const finalGmail = gmail || movie_source || '';
        const finalSize = size || '';
        const finalId = fileId || rawUrl.trim();

        setFormData(prev => {
          const next = {
            ...prev,
            title: finalTitle || prev.title,
            url: finalId,
            size: finalSize || prev.size,
            movie_source: finalGmail || prev.movie_source
          };

          if (isSeries && finalTitle) {
            let seriesName = finalTitle.replace(/\(\d{4}\)/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '_');
            next.part_name = seriesName;
          }

          return next;
        });

        setFetchStatus('success');
        setFetchMessage(`Fetched: "${finalTitle}" (${finalSize ? finalSize + ' MB' : ''}) • Host: ${finalGmail || 'Detected'}`);
      } else {
        setFetchStatus('error');
        setFetchMessage(data?.error || 'Could not fetch file info from Google Drive. Please ensure the link is shared with "Anyone with the link".');
      }
    } catch (err) {
      console.error('Failed to fetch Drive details:', err);
      setFetchStatus('error');
      setFetchMessage(err.response?.data?.error || err.message || 'Error communicating with Google Drive service.');
    } finally {
      setFetchingDrive(false);
    }
  };

  /**
   * One-click clipboard read and auto-fetch
   */
  const handlePasteClick = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.trim()) {
        const clean = clipboardText.trim();
        setFormData(prev => ({ ...prev, url: clean }));
        await processDriveUrl(clean);
      } else {
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('Clipboard read failed/blocked:', err);
      inputRef.current?.focus();
    }
  };

  /**
   * Handle onPaste directly on the input field
   */
  const handleInputPaste = (e) => {
    const pastedText = e.clipboardData?.getData('text') || '';
    if (pastedText && pastedText.trim()) {
      e.preventDefault();
      const clean = pastedText.trim();
      setFormData(prev => ({ ...prev, url: clean }));
      processDriveUrl(clean);
    }
  };

  /**
   * Handle text change with automatic detection for full Drive URLs
   */
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, url: val }));
    if (val.includes('drive.google.com/file/d/') || val.includes('drive.google.com/open?id=')) {
      processDriveUrl(val.trim());
    }
  };

  const handleIsSeriesChange = (e) => {
    const isChecked = e.target.checked;
    setIsSeries(isChecked);
    if (isChecked) {
      let seriesName = formData.title ? formData.title : '';
      seriesName = seriesName.replace(/\(\d{4}\)/g, '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, part_name: seriesName }));
    } else {
      setFormData(prev => ({ ...prev, part_name: '' }));
    }
  };

  const clearURL = () => {
    setFormData(prev => ({ ...prev, title: '', url: '', movie_source: '', size: '' }));
    setFetchStatus(null);
    setFetchMessage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      id: formData._id || formData.id || movie?.id,
      _id: formData._id || formData.id || movie?.id
    };

    axios.put('/api/movies', payload)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: 'Movie Updated!',
          text: 'The movie details have been successfully updated.',
        });
        setTimeout(() => {
          window.location.href = `/admin/movies?search=${encodeURIComponent(formData.title)}&page=1`;
        }, 1500);
      })
      .catch(error => {
        console.error('Error updating movie:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.response?.data?.error || 'An error occurred while updating the movie.',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {movie ? 'Edit Movie' : 'Upload New Movie'}
      </h3>

      {/* Datalist for registered storage Gmail accounts */}
      <datalist id="gmail-sources-update">
        {gmailList.map((email, idx) => (
          <option key={idx} value={email} />
        ))}
      </datalist>

      {movie?.poster && (
        <div className='my-5 flex justify-center mx-auto'>
          <img
            alt={movie.title || 'Movie Poster'}
            className="h-48 w-36 object-cover rounded-lg shadow transition-transform duration-500 hover:scale-105"
            src={getGoogleDriveImageUrl(formData.poster || movie.poster)}
          />
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Source Input Box with 1-Click Paste & Auto-Fetch */}
        <div className="grid grid-cols-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>Google Drive Source URL</span>
                {formData.url && (
                  <button
                    type="button"
                    onClick={clearURL}
                    title="Clear URL and Auto-details"
                    className="h-5 w-5 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                  >
                    <MdClear size={13} />
                  </button>
                )}
              </label>

              {fetchingDrive && (
                <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5 animate-pulse">
                  <FiLoader className="animate-spin" size={13} />
                  Searching Drive file details...
                </span>
              )}
              {!fetchingDrive && fetchStatus === 'success' && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <FiCheck size={14} />
                  Auto-fill Complete
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Click 'Paste & Auto-Fill' or paste Google Drive URL"
                  className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
                  value={formData.url}
                  onClick={() => {
                    if (!formData.url) handlePasteClick();
                  }}
                  onPaste={handleInputPaste}
                  onChange={handleUrlChange}
                  disabled={fetchingDrive}
                />
                {fetchingDrive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FiLoader className="animate-spin text-yellow-500" size={18} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePasteClick}
                disabled={fetchingDrive}
                className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
              >
                {fetchingDrive ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FiClipboard size={16} />
                    <span>Paste & Auto-Fill</span>
                  </>
                )}
              </button>
            </div>

            {/* Status / Error Alert */}
            {fetchStatus === 'error' && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
                <FiAlertCircle size={16} className="shrink-0" />
                <span>{fetchMessage}</span>
              </div>
            )}
            {fetchStatus === 'success' && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-700">
                <FiCheck size={16} className="shrink-0 text-emerald-600" />
                <span className="truncate">{fetchMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Fill Section Box */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Movie Details</span>
            <span className={`h-2.5 w-2.5 rounded-full ${formData.title ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block text-sm text-gray-700 mb-2">Movie Title</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size (MB)</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Host Gmail (movie_source)
              </label>
              <input
                type="text"
                list="gmail-sources-update"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={formData.movie_source}
                onChange={(e) => setFormData({ ...formData, movie_source: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Dropdowns and Checkbox */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Movie Type</label>
            <select
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="" disabled>🎬 Select Type</option>
              <option value="bangladeshi">Bangladeshi (🇧🇩)</option>
              <option value="kolkata-bangla">Kolkata Bangla (🇮🇳)</option>
              <option value="hindi">Hindi (🇮🇳)</option>
              <option value="english">English</option>
              <option value="yousuf-zulekha">Yousuf Zulekha</option>
              <option value="hatim">Hatim</option>
              <option value="alif-laila">Alif Laila</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dubbed Language</label>
            <select
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
              value={formData.dubbed_lang}
              onChange={(e) => setFormData({ ...formData, dubbed_lang: e.target.value })}
            >
              <option value="" disabled>🎧 Select Language</option>
              <option value="Bangla">Bangla</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bangla Dubbed">Bangla Dubbed</option>
              <option value="Hindi Dubbed">Hindi Dubbed</option>
              <option value="English Dubbed">English Dubbed</option>
              <option value="Tamil Dubbed">Tamil Dubbed</option>
              <option value="Telugu Dubbed">Telugu Dubbed</option>
              <option value="Others">Other Language</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className='flex space-x-2 items-center mb-2'>
              <input
                type="checkbox"
                id="isSeriesUpdate"
                className="w-5 h-5 accent-yellow-500 cursor-pointer"
                checked={isSeries}
                onChange={handleIsSeriesChange}
              />
              <label htmlFor="isSeriesUpdate" className="cursor-pointer text-sm font-semibold text-gray-700">
                Movie Series?
              </label>
            </span>
            <input
              type="text"
              placeholder="Series Slug (e.g. john_wick)"
              className={`w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white ${isSeries ? 'block' : 'hidden'}`}
              value={formData.part_name}
              onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Movie Poster
            </label>
            <ImageUploader className="w-full" setDriveId={setDriveId} initialDriveId={formData.poster || movie?.poster} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle URL</label>
            <input
              type="text"
              placeholder="Enter Subtitle URL"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
              value={formData.subtitle_url}
              onChange={(e) => setFormData({ ...formData, subtitle_url: e.target.value })}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all cursor-pointer ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-md'
          }`}
        >
          {loading ? 'Processing...' : movie ? 'Update Changes' : 'Publish Movie'}
        </button>
      </form>
    </div>
  );
}
