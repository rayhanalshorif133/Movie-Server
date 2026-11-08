"use client";

import ImageUploader from '@/components/common/ImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useRef, useState } from 'react';
import { MdClear } from "react-icons/md";
import { FiClipboard, FiCheck, FiLoader, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import Swal from 'sweetalert2';

export default function UploadMovie() {
  const [loading, setLoading] = useState(false);
  const [fetchingDrive, setFetchingDrive] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); // 'success' | 'error' | null
  const [fetchMessage, setFetchMessage] = useState('');
  const [gmailList, setGmailList] = useState([]);
  const [driveId, setDriveId] = useState('');
  const [isSeries, setIsSeries] = useState(false);
  const inputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    poster: '',
    type: 'Movie',
    url: '',
    size: '',
    movie_source: '',
    dubbed_lang: '',
    part_name: 'single',
    subtitle_url: '',
  });

  // Load registered Gmail accounts for source autocomplete suggestions
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

  /**
   * Process a Google Drive URL or File ID:
   * Fetches Title, Size (MB), File ID, and Host Gmail
   */
  const processDriveUrl = async (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return;
    if (fetchingDrive) return;

    setFetchingDrive(true);
    setFetchStatus(null);
    setFetchMessage('Connecting to Google Drive to fetch file metadata...');

    try {
      let data = null;

      // 1. Try Server Action first
      try {
        data = await getMovieFileInfo(rawUrl.trim());
      } catch (actionErr) {
        console.warn('Server action error, trying API route fallback:', actionErr);
      }

      // 2. Fallback to /api/movie-info REST endpoint if needed
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
        setFetchMessage(`Fetched successfully: "${finalTitle}" (${finalSize ? finalSize + ' MB' : 'Size detected'}) • Host: ${finalGmail || 'Detected'}`);
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
      console.warn('Clipboard read permission denied or unavailable:', err);
      // If clipboard access is blocked, focus the input for manual pasting
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
      seriesName = seriesName.replace(/\(\d{4}\)/g, '');
      seriesName = seriesName.toLowerCase();
      seriesName = seriesName.replace(/[^a-z\s]/g, '');
      seriesName = seriesName.trim().replace(/\s+/g, '_');
      setFormData(prev => ({ ...prev, part_name: seriesName }));
    } else {
      setFormData(prev => ({ ...prev, part_name: 'single' }));
    }
  };

  const clearURL = () => {
    setFormData(prev => ({
      ...prev,
      title: '',
      url: '',
      movie_source: '',
      size: ''
    }));
    setFetchStatus(null);
    setFetchMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('/api/movies', formData)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: 'Movie Uploaded!',
          text: 'The movie has been successfully uploaded.',
        });
        setTimeout(() => {
          window.location.href = `/admin/movies?search=${encodeURIComponent(formData.title)}&page=1`;
        }, 1500);
      })
      .catch(error => {
        console.error('Error uploading movie:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error.response?.data?.error || 'An error occurred while uploading the movie.',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Upload New Movie</h3>

      {/* Datalist for registered storage Gmail accounts */}
      <datalist id="gmail-sources">
        {gmailList.map((email, idx) => (
          <option key={idx} value={email} />
        ))}
      </datalist>

      <form onSubmit={handleUpload} className="space-y-6">

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
                    // Auto-paste if field is currently blank
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
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Auto-Filled Details</span>
            <span className={`h-2.5 w-2.5 rounded-full ${formData.title ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Movie Title */}
            <div>
              <label className="font-semibold block text-sm text-gray-700 mb-2">Movie Title</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
                placeholder="e.g. Interstellar"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Size (MB) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size (MB)</label>
              <input
                type="text"
                placeholder="e.g. 700"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            {/* Source / Host Gmail */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Host Gmail (movie_source)
              </label>
              <input
                type="text"
                list="gmail-sources"
                placeholder="e.g. rayhanalshorif2@gmail.com"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                value={formData.movie_source}
                onChange={(e) => setFormData({ ...formData, movie_source: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* type */}
          <div>
            <label htmlFor='movie_type' className="block text-sm font-semibold text-gray-700 mb-2">Movie Type</label>
            <select
              id='movie_type'
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="" disabled>🎬 Select Movie Type</option>
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

          {/* Dubbed Language */}
          <div>
            <label htmlFor='dubbed_lang' className="block text-sm font-semibold text-gray-700 mb-2">Dubbed Language</label>
            <select
              id='dubbed_lang'
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
              value={formData.dubbed_lang}
              onChange={(e) => setFormData({ ...formData, dubbed_lang: e.target.value })}
            >
              <option value="" disabled>🎧 Select Dubbed Language</option>
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

          {/* Series Checkbox */}
          <div>
            <span className='flex space-x-2 items-center mb-2'>
              <input
                type="checkbox"
                id="isSeries"
                className="w-5 h-5 accent-yellow-500 cursor-pointer"
                checked={isSeries}
                onChange={handleIsSeriesChange}
              />
              <label htmlFor='isSeries' className="cursor-pointer text-sm font-semibold text-gray-700">
                Movie Series?
              </label>
            </span>
            <input
              type="text"
              placeholder="Enter Series Slug (e.g. fast_and_furious)"
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
            <ImageUploader className="w-full" setDriveId={setDriveId} initialDriveId={formData.poster} />
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

        <div className={`w-full h-10 flex items-center justify-center bg-amber-500 rounded-lg transition-all ${!formData.poster ? 'flex' : 'hidden'}`}>
          <p className="text-center text-xs text-white font-medium">Make sure to upload the movie poster to Google Drive</p>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.poster}
          className={`w-full cursor-pointer ${formData.poster ? 'block' : 'hidden'} py-4 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-100'
            }`}
        >
          {loading ? 'Uploading Movie & Updating Sheet...' : 'Publish Movie'}
        </button>

      </form>
    </div>
  );
}
