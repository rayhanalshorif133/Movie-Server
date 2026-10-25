"use client"

import ImageUploader from '@/components/common/ImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useState } from 'react'
import { MdClear } from "react-icons/md";
import axios from "axios";
import Swal from 'sweetalert2';

// Note: Removed 'async' from the function declaration
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
  const [driveId, setDriveId] = useState('');
  const [isSeries, setIsSeries] = useState(false);

  // Movie prop asholei data update hobe
  useEffect(() => {
    if (movie) {
      setFormData({
        _id: movie.id || '',
        title: movie.title || '',
        poster: movie.poster || '',
        type: movie.type || '',
        url: movie.url || '',
        size: movie.size || '',
        movie_source: movie.movie_source || '',
        dubbed_lang: movie.dubbed_lang || '',
        part_name: movie.part_name || '',
        subtitle_url: movie.subtitle_url || '',
      });
      if (movie.part_name) setIsSeries(true);

      const driveURL = beautifyDriveURL(movie.url);
      setFormData(prev => ({ ...prev, url: driveURL }));
    }
  }, [movie]);

  useEffect(() => {
    if (driveId) {
      setFormData(prev => ({ ...prev, poster: driveId }));
    }
  }, [driveId]);

  const handlePaste = async () => {
    try {
      const URL = await navigator.clipboard.readText();
      if (!URL.includes('drive.google.com')) return; // Simple validation

      const data = await getMovieFileInfo(URL);
      const { fileId, name, gmail, size } = data;
      setFormData(prev => ({
        ...prev,
        title: name,
        url: fileId,
        movie_source: gmail,
        size: size
      }));
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };


  const beautifyDriveURL = (url) => {
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        return fileIdMatch[0];
      }
    }
    return url;
  }

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
  }

  const clearURL = () => {
    setFormData(prev => ({ ...prev, title: '', url: '', movie_source: '', size: '' }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    axios.put('/api/movies/', formData)
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
  }

  return (
    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {movie ? 'Edit Movie' : 'Upload New Movie'}
      </h3>

      <div className='my-5 flex justify-center mx-auto'>
        <img
          alt={movie.title}
          className="h-50 w-50 object-cover transition-transform duration-500 group-hover:scale-110"
          src={`https://lh3.googleusercontent.com/d/${movie.poster}`}
        />
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Source Input */}
        <div className="grid grid-cols-1">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              Source
              <button type="button" onClick={clearURL} className='ml-2 p-1 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition'>
                <MdClear size={14} />
              </button>
            </label>
            <input
              type="text"
              placeholder="Paste Google Drive URL"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.url}
              onFocus={handlePaste}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Movie Details</span>
            <span className={`h-2 w-2 rounded-full ${formData.url ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block text-sm text-gray-700 mb-2">Movie Title</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size (MB)</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-white"
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
              className="w-full p-3 border border-gray-200 rounded-lg outline-none"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">🎬 Select Type</option>
              <option value="bangladeshi">Bangladeshi (🇧🇩)</option>
              <option value="kolkata-bangla">Kolkata Bangla (🇮🇳)</option>
              <option value="hindi">Hindi (🇮🇳)</option>
              <option value="english">English</option>
              <option value="hatim">Hatim</option>
              <option value="alif-laila">Alif Laila</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dubbed Language</label>
            <select
              className="w-full p-3 border border-gray-200 rounded-lg outline-none"
              value={formData.dubbed_lang}
              onChange={(e) => setFormData({ ...formData, dubbed_lang: e.target.value })}
            >
              <option value="">🎧 Select Language</option>
              <option value="Bangla">Bangla</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bangla Dubbed">Bangla Dubbed</option>
              <option value="Hindi Dubbed">Hindi Dubbed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700 mb-2">
              <input
                type="checkbox"
                className="w-5 h-5 accent-yellow-500"
                checked={isSeries}
                onChange={handleIsSeriesChange}
              />
              <span>Movie Series?</span>
            </label>
            {isSeries && (
              <input
                type="text"
                placeholder="Series Slug (e.g. john_wick)"
                className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                value={formData.part_name}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Movie Poster
            </label>
            <ImageUploader className="w-full" setDriveId={setDriveId} />

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
          className={`w-full py-4 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 shadow-md'
            }`}
        >
          {loading ? 'Processing...' : movie ? 'Update Changes' : 'Publish Movie'}
        </button>
      </form>
    </div>
  )
}