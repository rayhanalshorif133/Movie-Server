"use client"
import ImageUploader from '@/components/common/ImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useState } from 'react'
import { MdClear } from "react-icons/md";
import axios from "axios";


export default function UploadMovie() {
  const [loading, setLoading] = useState(false);
  const [driveId, setDriveId] = useState('');
  const [isSeries, setIsSeries] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    poster: '',
    type: 'Movie', // Default type
    url: '',
    size: '',
    movie_source: '',
    dubbed_lang: '',
    part_name: 'single',
    subtitle_url: '',
  });


  const handlePaste = async () => {
    try {
      const URL = await navigator.clipboard.readText();
      const data = await getMovieFileInfo(URL);
      const { fileId, name, gmail, size } = data;
      setFormData({ ...formData, title: name, url: fileId, movie_source: gmail, size: size });

    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };


  const handleIsSeriesChange = (e) => {
    var isChecked = e.target.checked;
    setIsSeries(isChecked);
    if (isChecked) {

      var seriesName = formData.title ? formData.title : '';
      seriesName = seriesName.replace(/\(\d{4}\)/g, '');
      seriesName = seriesName.toLowerCase();
      seriesName = seriesName.replace(/[^a-z\s]/g, '');
      seriesName = seriesName.replace(/\s+/g, '_');
      setFormData({ ...formData, part_name: seriesName });
    } else {
      setFormData({ ...formData, part_name: '' });
    }
  }

  const clearURL = async () => {
    setFormData({ ...formData, title: '', url: '', movie_source: '', size: '' });
  };

  useEffect(() => {
    if (driveId) {
      setFormData({ ...formData, poster: driveId })
    }
  }, [driveId]);



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
      })
      .finally(() => setLoading(false));
    setTimeout(() => setLoading(false), 2000) // Demo loading
  }



  return (
    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Upload New Movie</h3>

      <form onSubmit={handleUpload} className="space-y-6">

        <div className="grid grid-cols-1">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex">
              Source <button onClick={clearURL} className='h-5 w-5 mx-2 cursor-pointer hover:scale-105 rounded-full bg-gray-300 hover:bg-red-500 hover:text-white flex items-center justify-center'><MdClear size={14} className='flex items-center justify-center' /></button>
            </label>
            <input
              type="text"
              placeholder="Paste Google Drive URL and Auto-Fill Details"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.url}
              onClick={handlePaste}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
        </div>

        {/* Auto-Fill Section Box */}
        <div className="bg-gray-200 border-2 border-dashed border-gray-200 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Auto Details</span>
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Movie Title */}
            <div>
              <label className="font-semibold  block text-sm  text-gray-700 mb-2">Movie Title</label>
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

            {/* Source */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
              <input
                type="text"
                placeholder="e.g. Netflix, Torrent"
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
            <select id='movie_type'
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.movieType}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="" disabled="" selected="">🎬 Select Movie Type</option>
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
            <select id='dubbed_lang'
              className="w-full cursor-pointer p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              value={formData.dubbed_lang}
              onChange={(e) => setFormData({ ...formData, dubbed_lang: e.target.value })}
            >
              <option value="" selected disabled>🎧 Select Dubbed Language</option>
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
          <div>
            <span className='flex space-x-2'>
              <label htmlFor='isSeries' className="block cursor-pointer text-sm font-semibold text-gray-700 mb-2">Movie Series?</label>
              <input
                type="checkbox"
                id="isSeries"
                className="w-5 h-5 accent-yellow-500"
                checked={isSeries}
                onChange={handleIsSeriesChange}
              />
            </span>
            <input
              type="text"
              placeholder="Enter Series Name"
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

        <div className={`w-full h-10 flex items-center justify-center bg-red-500 ${!formData.poster ? 'block' : 'hidden'}`}>
          <p className="text-center text-xs text-white my-10">Make sure to upload the movie poster to Google Drive</p>
        </div>

        <button
          disabled={loading}
          className={`w-full cursor-pointer ${formData.poster ? 'block' : 'hidden'} py-4 rounded-lg font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-100'
            }`}
        >
          {loading ? 'Uploading Assets...' : 'Publish Movie'}
        </button>

      </form>
    </div>
  )
}