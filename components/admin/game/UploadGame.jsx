"use client"
import ImageUploader from '@/components/common/ImageUploader';
import MultiImageUploader from '@/components/common/MultiImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useState } from 'react'
import { MdClear } from "react-icons/md";
import { FiClipboard, FiLoader, FiCheck } from "react-icons/fi";
import axios from "axios";
import Swal from 'sweetalert2';
import GameUploadErrorMessage from './_partials/GameUploadErrorMessage';

export default function UploadGame() {

  const [loading, setLoading] = useState(false);
  const [driveId, setDriveId] = useState('');
  const [type, setTypes] = useState('');
  const [driveIds, setDriveIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState();
  const [fetchingDrive, setFetchingDrive] = useState(false);
  const [gmailList, setGmailList] = useState([]);

  const API_URL = "/api/games/type";

  const fetchTypes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (res.ok) setTypes(data);
    } catch (error) {
      console.error("Failed to fetch types:", error);
    }
  };

  useEffect(() => {
    fetchTypes();
    axios.get('/api/gmails?page=0&limit=100')
      .then(res => {
        if (res.data?.data) {
          const emails = res.data.data.map(g => g.name || g.email).filter(Boolean);
          setGmailList([...new Set(emails)]);
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    size: 0,
    asset_type: '',
    game_type: '',
    gif_hidden_bar: false,
    gmail: '',
    thumbnail_image: '',
    asset_images: [],
    asset_gif_images: [],
  });

  const processDriveUrl = async (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) return;
    if (fetchingDrive) return;

    setFetchingDrive(true);
    setErrorMsg('');

    try {
      let data = null;
      try {
        data = await getMovieFileInfo(rawUrl.trim());
      } catch (err) {
        console.warn('Game drive info error:', err);
      }

      if (!data || !data.success) {
        const res = await axios.get(`/api/movie-info?url=${encodeURIComponent(rawUrl.trim())}`);
        data = res.data;
      }

      if (data && data.success) {
        const { fileId, name, gmail, size } = data;
        const finalId = fileId || rawUrl.trim();
        const finalName = name || '';

        axios.get(`/api/games/check-duplicate-entry?title=${encodeURIComponent(finalName)}&url=${encodeURIComponent(finalId)}`)
          .then((response) => {
            const checkData = response.data;
            setErrorMsg(checkData.message);
            if (checkData.status === 'success') {
              setFormData(prev => ({
                ...prev,
                title: finalName || prev.title,
                url: finalId,
                gmail: gmail || prev.gmail,
                size: size || prev.size
              }));
            }
          })
          .catch(() => {
            setFormData(prev => ({
              ...prev,
              title: finalName || prev.title,
              url: finalId,
              gmail: gmail || prev.gmail,
              size: size || prev.size
            }));
          });
      } else {
        setErrorMsg(data?.error || 'Failed to fetch details from Google Drive.');
      }
    } catch (err) {
      console.error('Failed to read Drive file:', err);
      setErrorMsg('Error communicating with Google Drive.');
    } finally {
      setFetchingDrive(false);
    }
  };

  const handlePaste = async () => {
    try {
      const URL = await navigator.clipboard.readText();
      if (URL && URL.trim()) {
        setFormData(prev => ({ ...prev, url: URL.trim() }));
        await processDriveUrl(URL.trim());
      }
    } catch (err) {
      console.warn('Failed to read clipboard contents:', err);
    }
  };

  const handleInputPaste = (e) => {
    const text = e.clipboardData?.getData('text') || '';
    if (text && text.trim()) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, url: text.trim() }));
      processDriveUrl(text.trim());
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, url: val }));
    if (val.includes('drive.google.com/file/d/') || val.includes('drive.google.com/open?id=')) {
      processDriveUrl(val.trim());
    }
  };



  const clearURL = () => {

    setErrorMsg('');
    setFormData(prev => ({
      ...prev,
      title: '',
      url: '',
      gmail: '',
      size: 0
    }));

  };

  useEffect(() => {

    if (driveId) {

      setFormData(prev => ({
        ...prev,
        thumbnail_image: driveId
      }));

    }

  }, [driveId]);


  /* auto split image & gif */

  useEffect(() => {

    if (driveIds.length === 0) return;

    const images = [];
    const gifs = [];

    console.clear();
    console.log("driveIds", driveIds);
    driveIds.forEach(file => {

      if (file.type.includes("gif")) {
        gifs.push(file.id);
      } else {
        images.push(file.id);
      }

    });

    setFormData(prev => ({
      ...prev,
      asset_images: images,
      asset_gif_images: gifs
    }));

  }, [driveIds]);


  const handleUpload = async (e) => {

    e.preventDefault();

    setLoading(true);

    const payload = {
      ...formData
    };

    axios.post('/api/games', payload)

      .then(response => {


        Swal.fire({
          icon: 'success',
          title: 'Asset Uploaded!',
          text: 'The game asset has been successfully listed.',
        });

        setTimeout(() => {

          window.location.href =
            `/admin/games?search=${encodeURIComponent(formData.title)}&page=1`;

        }, 1500);

      })

      .catch(error => {
        console.error('Error uploading asset:', error);
      })

      .finally(() => setLoading(false));
  }


  return (

    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">

      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Upload New Game Assets
      </h3>

      {/* Datalist for registered Gmail accounts */}
      <datalist id="game-uploader-emails">
        {gmailList.map((email, idx) => (
          <option key={idx} value={email} />
        ))}
      </datalist>

      <form onSubmit={handleUpload} className="space-y-6">

        {/* Google Drive URL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              Asset File URL (G-Drive)
              {formData.url && (
                <button
                  type="button"
                  onClick={clearURL}
                  className="h-5 w-5 mx-2 cursor-pointer hover:scale-105 rounded-full bg-gray-300 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                >
                  <MdClear size={14} />
                </button>
              )}
            </label>
            {fetchingDrive && (
              <span className="text-xs font-medium text-blue-600 flex items-center gap-1.5 animate-pulse">
                <FiLoader className="animate-spin" size={13} />
                Fetching Drive asset details...
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Click to auto-paste or paste Google Drive URL"
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"
                value={formData.url}
                onClick={() => {
                  if (!formData.url) handlePaste();
                }}
                onPaste={handleInputPaste}
                onChange={handleUrlChange}
                disabled={fetchingDrive}
              />
              {fetchingDrive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FiLoader className="animate-spin text-blue-500" size={18} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePaste}
              disabled={fetchingDrive}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
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

          <div className="mt-3">
            {errorMsg && <GameUploadErrorMessage errorMsg={errorMsg} />}
          </div>
        </div>


        {/* Metadata */}

        <div className="bg-blue-50 border-2 border-dashed border-blue-100 p-6 rounded-xl space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>

              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Asset Name
              </label>

              <input
                required
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

            </div>


            <div>

              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Size (MB)
              </label>

              <input
                type="number"
                step="0.01"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />

            </div>


            <div>

              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Uploader Email
              </label>

              <input
                type="text"
                list="game-uploader-emails"
                className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                value={formData.gmail}
                onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
              />

            </div>

          </div>

        </div>


        {/* Asset type + Engine */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            className="p-3 border rounded-lg"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
          >

            <option value="" disabled selected>Select Type</option>
            <option value="game">Game</option>
            <option value="asset">Asset</option>
          </select>


          <select
            className="p-3 border rounded-lg"
            value={formData.game_type}
            onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
          >

            <option value="" disabled selected>Game Type</option>
            {
              type.length > 0 && type.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))
            }

          </select>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              id="gif_hidden_bar"
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              checked={!!formData.gif_hidden_bar}
              onChange={(e) => setFormData({ ...formData, gif_hidden_bar: e.target.checked })}
            />
            <label htmlFor="gif_hidden_bar" className="cursor-pointer font-medium select-none">
              Gif Hidden Bar
            </label>
          </div>


        </div>


        {/* Media Upload */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="font-semibold text-sm block mb-2">
              Main Thumbnail
            </label>

            <ImageUploader setDriveId={setDriveId} />

          </div>


          <div>

            <label className="font-semibold text-sm block mb-2">
              Preview Images / GIFs
            </label>

            <MultiImageUploader
              setDriveIds={setDriveIds}
            />

            <p className="text-xs text-gray-400 mt-2">
              Upload images or gifs together. They will auto separate.
            </p>

          </div>

        </div>


        {!formData.thumbnail_image && (

          <div className="w-full h-10 flex items-center justify-center bg-amber-500 rounded-lg">

            <p className="text-xs text-white">
              Please upload a thumbnail to enable publishing
            </p>

          </div>

        )}


        <button
          disabled={loading || !formData.thumbnail_image}
          className={`w-full py-4 rounded-lg font-bold text-white ${loading || !formData.thumbnail_image
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >

          {loading ? "Uploading Assets..." : "Publish Game Asset"}

        </button>


      </form>

    </div>
  )
}